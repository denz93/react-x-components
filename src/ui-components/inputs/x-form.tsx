import styled, { keyframes } from "styled-components";
import { FormContext, IFormField, IFormStage } from "../hooks/useForm";
import XInput from "./xinput";
import { useMemo } from "react";

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
        validateStage
    } = form

    const FormStageList = useMemo(() => {
        return stages.map((stage, idx) => <StyledFormGroup key={idx} data-current={idx === currentStage}>
            {Object.keys(stage).map(fieldName => {
                const {type, label, required} = stage[fieldName]
                return <StyledXInput 
                    key={fieldName} 
                    type={stage[fieldName].type} 
                    placeholder={label??fieldName}
                    value={fields[fieldName]}
                    onChange={(val) => updateField(fieldName, val)}
                    data-has-error={errors && fieldName in errors}
                />
            })}
        </StyledFormGroup>)
    }, [stages, currentStage])

    return <StyledForm>
        <p>Form step {currentStage + 1}/{totalStages}</p>
        <StyledFormGroupWrapper>
            { FormStageList }
        </StyledFormGroupWrapper>
        <ActionList>
            {hasBack && <Button type="button" disabled={!hasBack} onClick={() => {
                back()
            }}>Back</Button>}

            {hasNext && <Button type="button" disabled={!hasNext} onClick={() => { 
                const err = validateStage(currentStage)
                !err && next()
            }}>Next</Button>}

            {!hasNext && <Button type="button" onClick={() => {
                validateStage(currentStage)
                submit()
            }}>Submit</Button>}
        </ActionList>
    </StyledForm>
}

const StyledForm = styled.form`
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

const Button = styled.button.attrs({type: 'button'})`
    color: inherit;
    padding: .7em 1em;
    background-color: transparent;
    border-color: currentColor;
    outline: none;
    border: 1px solid currentColor;
`

const StyledXInput = styled(XInput)`
    &[data-has-error="true"] {
        position: relative;
        animation: Shake 1s ease-in-out;
        outline: red 1px solid;
    }
`

const Shake = keyframes`
    0%, 20%, 40% {
        transform: translateX(-10%);
    }
    10%, 30%, 50% {
        transform: translateX(10%);
    }
    100% {
        transform: translateX(0);
    }
`