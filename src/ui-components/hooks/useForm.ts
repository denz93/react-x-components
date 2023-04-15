import { isValidElement, useCallback, useState } from "react"

export interface IFormField {
    type: 'text' | 'password'
    required?: boolean
    label?: string
}

export interface IFormStage {
    [fieldName: string]: IFormField
}

export type IUseFormProps = IFormStage[]

type GetFieldNames<T> = keyof T
export interface FormContext<T extends IFormStage> {
    fields: {[fieldName in GetFieldNames<T>]: string}
    updateField: (fieldName: GetFieldNames<T>, value: string) => void 
    stage: number
    stages: T[]
    errors: {[fieldName in GetFieldNames<T>]: string} | null
    totalStages: number 
    isFinish: boolean 
    reset: () => void 
    next: () => void 
    back: () => void 
    hasNext: boolean
    hasBack: boolean
    validateStage: (stage: number) => {[fieldName in GetFieldNames<T>]: string} | null
    clearStage: () => void 
    submit: () => void
}
export function useForm<T extends IFormStage>(stages: T[]): FormContext<T> {
    const defaultState = stages.reduce((obj, stage) => {
        Object.keys(stage).forEach((fieldName: GetFieldNames<T>) => {
            obj[fieldName] = ''
            
        })
        return obj
    }, {} as {[fieldName in GetFieldNames<T>]: string})
    const [state, setState] = useState<{[fieldName in GetFieldNames<T>]: string}>(defaultState)
    const [stage, setStage] = useState(0)
    const [errors, setErrors] = useState<{[fieldName in GetFieldNames<T>]: string} | null>(null)
    const [isSubmited, setIsSubmited] = useState(false)

    const isFinish = stage === stages.length && isSubmited

    const updateField = useCallback((fieldName: GetFieldNames<T>, val: string) => {
        setState({...state, [fieldName]: val})
    }, [state]) 

    const reset = () => {
        setStage(0)
        setIsSubmited(false)
        setState(defaultState)
    }

    const clearStage = useCallback(() => {
        const fields = stages[stage]
        setState({...state, ...Object.keys(fields).reduce((obj, k) => {
            obj[k] = ''
            return obj
        }, {} as any) })
    }, [stage, state])

    const next = () => {
        setStage((stage) => stage < stages.length - 1 ? stage + 1 : stage)
    }

    const back = () => {
        setStage((stage) => stage > 0 ? stage - 1 : stage)
    }

    const hasNext = stage < stages.length - 1
    const hasBack = stage > 0

    const validateStage = useCallback((stage: number) => {
        const formStage = stages[stage]
        let errors: {[fieldName in GetFieldNames<T>]: string} | null = null 

        Object.keys(formStage).forEach((fieldName: GetFieldNames<T>) => {
            if (formStage[fieldName].required && typeof state[fieldName] === 'string') {
                errors = {...(errors??{} as any), [fieldName]: `"${String(fieldName)}" is required`}
            }
        })
        setErrors(errors)
        return errors
    }, [])

    const submit = useCallback(() => {
        const errs = validateStage(stage)
        if (errs === null || errs === undefined) {
            setIsSubmited(true)
        } else {
            setErrors(errs)
        }
    }, [stage])

    return { 
        fields: state, 
        updateField,
        stage,
        stages,
        errors,
        totalStages: stages.length, 
        isFinish, 
        reset, 
        clearStage,
        submit,
        next,
        back,
        hasNext,
        hasBack,
        validateStage
    }
}

