import styled, { keyframes } from "styled-components";
import { FormContext, IFormStage } from "../hooks/useForm";
import {XInput} from "./xinput";
import { useMemo } from "react";
import { XButton } from "../buttons/x-button";

export function XForm<T extends IFormStage>({form}: {form: FormContext<T>}) {
    const { 
        stage: currentStage, 
        totalStages, 
        stages, 
        fields, 
        updateField, 
        hasNext, 
        next, 
        hasBack,
        submit,
        back,
        errors,
        validateStage,
        isFinish
    } = form

    const FormStageList = useMemo(() => {
        return stages.map((stage, idx) => <StyledFormGroup key={idx} data-current={idx === currentStage}>
            {Object.keys(stage).map(fieldName => {
                const {type, label, required} = stage[fieldName]
                return <InputWrapper 
                    data-has-error={errors && fieldName in errors}
                    key={fieldName} 
                >
                    <XInput
                        type={stage[fieldName].type} 
                        placeholder={label??fieldName}
                        value={fields[fieldName]}
                        onChange={(val) => updateField(fieldName, val)}
                    />
                </InputWrapper>
            })}
        </StyledFormGroup>)
    }, [stages, currentStage])
    
    return <StyledForm>
        <p>Form step {currentStage + 1}/{totalStages}</p>
        <StyledFormGroupWrapper>
            { FormStageList }
        </StyledFormGroupWrapper>
        <ActionList>
            {!isFinish && hasBack && <XButton type="button" disabled={!hasBack} onClick={() => {
                back()
            }}>Back</XButton>}

            {hasNext && <XButton type="button" disabled={!hasNext} onClick={() => { 
                const err = validateStage(currentStage)
                !err && next()
            }}>Next</XButton>}

            {!hasNext && <XButton type="button" onClick={() => {
                const err = validateStage(currentStage)
                !err && submit()
            }}>Submit</XButton>}
            
            <div></div>
        </ActionList>
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
    &[data-has-error="true"] {
        position: relative;
        animation: ${Shake} 1s ease-in-out;
        outline: red 1px solid;
    }
`