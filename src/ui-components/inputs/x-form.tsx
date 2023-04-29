import styled, { keyframes } from "styled-components";
import { FormContext, IFormStage } from "../hooks/useForm";
import {XInput} from "./xinput";
import { useMemo } from "react";
import { XButton } from "../buttons/x-button";
import { H2, H3 } from "../texts/heading";
import { XTooltip } from "../tooltips/x-tooltips";
import { XPhoneInput } from "./x-phone-input";

export interface IXFormProps<TFormStage extends IFormStage> {
    form: FormContext<TFormStage>
    title?: string 
    submitLabel?: string
}
export function XForm<T extends IFormStage>({form, title, submitLabel='submit'}: IXFormProps<T>) {
    const { 
        currentStage, 
        totalStages,
        stageNameList,
        stageList, 
        fieldMap, 
        updateField, 
        hasNext, 
        next, 
        hasBack,
        submit,
        back,
        errors,
        validateStage,
        isFinish,
        reset
    } = form

    const FormStageList = useMemo(() => {
        return stageList.map((stage, idx) => <StyledFormGroup key={idx} data-current={idx === currentStage}>
            <H3>{Number.isSafeInteger(parseInt(stageNameList[idx])) ? `Step ${stageNameList[idx]}` : stageNameList[idx]}</H3>
            {Object.keys(stage).map(fieldName => {
                const {type, label} = stage[fieldName]
                return <InputWrapper 
                    data-has-error={errors && fieldName in errors}
                    key={fieldName}
                >
                    {errors && fieldName in errors && <Error type="error" message={errors[fieldName]}/>} 
                    { (type === 'text' || type === 'password') && <XInput
                        disabled={isFinish}
                        type={type} 
                        placeholder={label??fieldName}
                        value={fieldMap[fieldName]}
                        onChange={(val) => updateField(fieldName, val)}
                    />}
                    {type === 'phone' && <XPhoneInput
                        value={fieldMap[fieldName]}
                        defautCountryCode={'us'}
                        allowedCountries={['us']}
                        phoneTemplate={'$$$-$$$-$$$$'}
                        placeholder={label}
                        onChange={(val) => updateField(fieldName, val)}
                    />}
                </InputWrapper>
            })}
        </StyledFormGroup>)
    }, [stageList, currentStage, errors, isFinish, fieldMap])
    
    return <StyledForm >
        <H2>{title}</H2>
        <StyledFormGroupWrapper>
            { FormStageList }
        </StyledFormGroupWrapper>
        <ActionList>
            {!isFinish && <>
                {hasBack && <XButton type="button" disabled={!hasBack} onClick={() => {
                    back()
                }}>Back</XButton>}

                {hasNext && <XButton type="button" disabled={!hasNext} onClick={() => { 
                    const err = validateStage(currentStage)
                    !err && next()
                }}>Next</XButton>}

                {!hasNext && <XButton type="button" onClick={() => {
                    const err = validateStage(currentStage)
                    !err && submit()
                }}>{submitLabel}</XButton>}
            </>}
            

            {isFinish && <XButton type="button" onClick={() => reset()}>Reset</XButton>}
            
        </ActionList>
        <div>Finish: {isFinish ? 'true' : 'false'}</div>
    </StyledForm>
}

const StyledForm = styled.form`
    color: ${props => props.theme.XComponent?.global?.text?? 'currentColor'};
    display: grid;
    gap: 1em;
    grid-template-columns: 1fr;
    width: 15em;
`

const StyledFormGroupWrapper = styled.div`
    display: grid;
    grid-template-columns: 1fr;
`

const StyledFormGroup = styled.section`
    display: grid;
    grid-template-columns: 1fr;
    gap: 1em;
    grid-column-start: 1;
    grid-column-end: 1;
    grid-row-start: 1;
    grid-row-end: 1;
    opacity: 0;
    pointer-events: none;
    transition: opacity .4s ease-in-out, transform .2s ease-in-out;
    transform: scale(0);
    &[data-current="true"] {
        pointer-events: all;
        opacity: 1;
        transition: opacity .4s ease-in-out, transform .4s ease-in-out;
        transform: scale(1);
    }

`

const ActionList = styled.div`
    display: flex;
    gap: 2em;
    justify-content: space-evenly;
`

const Shake = keyframes`
    0%, 20%, 40% {
        transform: translateX(-10%);
    }
    10%, 30%, 50% {
        transform: translateX(10%);
    }
    60%, 100% {
        transform: translateX(0);
    }
`
const InputWrapper = styled.div`
    position: relative;
    height: fit-content;
    border-radius: ${props => props.theme.XComponent?.__borderRadius('input')??'0'};
    &[data-has-error="true"] {
        position: relative;
        animation: ${Shake} 1s ease-in-out;
        box-shadow: 0 0 10px 1px ${props => props.theme.XComponent?.global?.color?.error??'currentColor'};
    }
`

const Error = styled(XTooltip)`
    left: calc(100% + 1em);
    top: 50%;
    transform: translateY(-.5em);
`