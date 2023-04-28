import { useCallback, useMemo, useState } from "react"
import { Validator } from "../../libs/validator"

export interface IFormField {
    type: 'text' | 'password' | 'phone'
    label?: string
    defaultValue?: string
    constraints?: Validator<'string'>
}

export interface IFormStage {
    [fieldName: string]: IFormField
}

type StageMap<T extends IFormStage> = {[stageName: string]: T}
type GetFieldNames<T extends IFormStage> = keyof T
type FieldNameType<T extends IFormStage> = GetFieldNames<T>
type FieldMapType<T extends IFormStage> = {[fieldName in GetFieldNames<T>]: string}
type ErrorMapType<T extends IFormStage> = {[fieldName in GetFieldNames<T>]: string}

export type IUseFormProps<TFormStage extends IFormStage> = StageMap<TFormStage> | TFormStage[]

export interface FormContext<T extends IFormStage> {
    fieldMap: FieldMapType<T>
    updateField: (fieldName: FieldNameType<T>, value: string) => void 
    currentStage: number
    stageNameList: string[]
    stageList: T[]
    errors: ErrorMapType<T> | null
    totalStages: number 
    isFinish: boolean 
    hasNext: boolean
    hasBack: boolean
    reset: () => void 
    next: () => void 
    back: () => void 
    validateStage: (stage: number) => ErrorMapType<T> | null
    clearStage: (stageIdx: number) => void 
    submit: () => void
    setErrors: (errors: ErrorMapType<T> | null) => void
}
export function useForm<T extends IFormStage>(initialStageMap: IUseFormProps<T>): FormContext<T> {
    const stageNameList = useMemo(() => Array.isArray(initialStageMap) ? new Array(initialStageMap.length).fill(0).map((_, idx) => `${idx}`) : Object.keys(initialStageMap), [])
    const stageList = useMemo(() => Array.isArray(initialStageMap) ? initialStageMap : Object.values(initialStageMap), [])
    
    const defaultState = useMemo(() => stageList.reduce((obj, stage) => {
        Object.keys(stage).forEach((fieldName: FieldNameType<T>) => {
            obj[fieldName] = stage[fieldName].defaultValue ?? ''
        })
        return obj
    }, {} as FieldMapType<T>), [])

    const [fieldMap, setFieldMap] = useState<FieldMapType<T>>(defaultState)
    const [currentStage, setCurrentStage] = useState(0)
    const [errors, setErrors] = useState<{[fieldName in GetFieldNames<T>]: string} | null>(null)
    const [isSubmited, setIsSubmited] = useState(false)

    const isFinish = currentStage === stageList.length - 1 && isSubmited
    const hasNext = currentStage < stageList.length - 1
    const hasBack = currentStage > 0

    const updateField = useCallback((fieldName: FieldNameType<T>, val: string) => {
        setFieldMap((fieldMap) => ({...fieldMap, [fieldName]: val}))
    }, []) 

    const reset = useCallback(() => {
        setCurrentStage(() => 0)
        setIsSubmited(() => false)
        setFieldMap(() => defaultState)
    }, [])
    
    const clearStage = useCallback((stageIdx: number) => {
        const fields = stageList[stageIdx]
        setFieldMap((fieldMap) => ({...fieldMap, ...Object.keys(fields).reduce((obj, k: FieldNameType<T>) => {
            obj[k] = ''
            return obj
        }, {} as FieldMapType<T>) }))
    }, [])

    const next = useCallback(() => {
        setCurrentStage((stage) => stage < stageList.length - 1 ? stage + 1 : stage)
    }, [])

    const back = useCallback(() => {
        setCurrentStage((stage) => stage > 0 ? stage - 1 : stage)
    }, [])


    const validateStage = useCallback((stageIdx: number) => {
        const formStage = stageList[stageIdx]
        let errors: ErrorMapType<T> | null = null 
        Object.keys(formStage).forEach((fieldName: FieldNameType<T>) => {
            const stage = formStage[fieldName]
            const err = stage.constraints?.safeValidate(fieldMap[fieldName])
            if (err)
                errors = {...(errors??{} as any), [fieldName]: err}
            
        })
        setErrors(errors)
        return errors
    }, [stageList, fieldMap])

    const submit = useCallback(() => {

        const errs = validateStage(stageList.length-1)
        if (errs === null || errs === undefined) {
            setIsSubmited(true)
        } else {
            setErrors(errs)
        }
    }, [validateStage])

    return { 
        fieldMap, 
        updateField,
        currentStage,
        stageNameList,
        stageList,
        errors,
        totalStages: stageList.length, 
        isFinish, 
        reset, 
        clearStage,
        submit,
        next,
        back,
        hasNext,
        hasBack,
        validateStage,
        setErrors
    }
}

