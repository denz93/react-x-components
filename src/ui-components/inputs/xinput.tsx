import React, { FormEvent, SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import { useXTheme } from '../createTheme'
import { withGlowBorderEffect } from '../higher-order-components/with-glow-effect'
import { safeInvoke } from '../../libs/safe-invoker'
import { IXBaseInputProps } from '../interfaces'

const HTML_SPACE_CHAR = '&nbsp;'



export interface IXInputProps extends IXBaseInputProps<string> {
    type: "text" | "password"
    
    /**
     * @description
     * 
     * The display template will reflect how user's input represent.
     * 
     * @example1
     * Display template for phone number: $$$-$$$-$$$$
     *  1. User input: 123 => display 123
     *  2. User input: 1234 => display 123-4
     *  3. User input: 123456 => display 123-456
     *  4. User input: 1234567890 => display 123-456-7890
     * 
     * @example2
     * Display template for date: $$/$$/$$$$
     *  1. User input: 012 => display 01/2
     *  2. User input: 012522 => display 01/25/22
     *  3. User input: 01252022 => display 01/25/2022
     * 
     * @explain
     * $: represent a character that users input
     * 
     * - and /: is a template string. It could be any characters that you want to display
     */
    displayTemplate: string
    
}


export function XInputRaw ({
    placeholder = '', 
    type = 'text',
    displayTemplate = '',
    value: propValue,
    name,
    onBlur,
    onChange,
    onClick,
    onFocus,
    ...props
    }: Partial<IXInputProps>) {

    const theme = useXTheme()
    const [value, setValue] = useState('')
    const [composition, setComposition] = useState<number | null>(null)
    const [focus, setFocus] = useState(false)
    const [selection, setSelection] = useState<[number, number]>([0,0])
    const inputRef = useRef<HTMLDivElement>(null)
    const builtinInputRef = useRef<HTMLInputElement>(null)

    const cursor = selection[0]

    const displayValue = useMemo(
        () => formatValue(value, displayTemplate), 
        [value, displayTemplate])

    const displayCursor = useMemo(() => {
        return inputCursor2DisplayCursor(cursor, displayTemplate)
    }, [cursor, displayTemplate])

    const displaySelection = useMemo(() => {
        const displaySelection = [
            inputCursor2DisplayCursor(selection[0], displayTemplate),
            inputCursor2DisplayCursor(selection[1], displayTemplate)
        ]
        return displaySelection
    }, [selection, displayTemplate])

    const display = useMemo(() => {
        let charList = displayValue.split('').map(c => c === ' ' ? HTML_SPACE_CHAR : c)
        charList = type === 'password' ? charList.map((c, idx) => idx === displayCursor && focus ? c : '*') : charList
       
        return <>
            {charList.map((c, idx) => <Char
                key={idx}
                role={idx === displayCursor ? "caret" : ""}
                data-key={c === HTML_SPACE_CHAR ? (theme?.input?.space ?? '⎵') : c}
                data-selected={idx >= displaySelection[0] && idx < displaySelection[1]}
                className={idx === composition ? "composition" : ""}
                dangerouslySetInnerHTML={{__html: c}}
            />)}
            {charList.length <= displayCursor && <Char 
                role="caret" 
                className='self'
                data-key={theme?.input?.caret ?? "_"}
                >
                    {theme?.input?.caret ?? '_'}
                </Char>}
        </>
    } , [displayValue, composition, displaySelection, displayCursor, focus])  

    const compositionCallback = useCallback((event: React.CompositionEvent) => {
        switch(event.type) {
            case 'compositionstart':
                setComposition(value.length)
                break;
            case 'compositionend':
                setComposition(null)
                break;
           
        }
    }, [value])

    const builtInInputChangeCallback = useCallback((event: FormEvent<HTMLInputElement>) => {
        const newVal = event.currentTarget.value
        const valueByTemplate = getValueByTemplate(newVal, displayTemplate)
        setValue(valueByTemplate);
        safeInvoke(onChange, valueByTemplate)
    }, [onChange, displayTemplate])

    const builtInSelectionCallback = useCallback((event: SyntheticEvent<HTMLInputElement>) => {
        const {selectionStart, selectionEnd} = event.currentTarget

        const newSelection = [selectionStart??0, selectionEnd??0] as [number, number]
        setSelection(
            (selection) => selection[0] !== newSelection[0] || selection[1] !== newSelection[1] 
                ? newSelection
                : selection
        )
        
    }, [])


    useEffect(() => {
        if (!inputRef.current) return 

        if (isCursorOffScreen(cursor, value.length, inputRef.current)) {
            const input = inputRef.current
            const realSize = input.scrollWidth
            const nominalSize = input.clientWidth
            const position = realSize / value.length * cursor 
            input.scrollLeft = position
        }
    },[cursor, value])

    useEffect(() => {
        const val = typeof propValue !== 'string' ? '' : propValue
        setValue(val)
    }, [propValue])

    return <InputWrapper
        {...props }
        tabIndex={0} 
        onBlur={() => {
            setFocus(false)
            safeInvoke(onBlur)
        }}
        onClick={onClick}
        onFocusCapture={() => {
            setFocus(true);
            safeInvoke(onFocus)
            builtinInputRef.current?.focus()
        }}
        onCompositionEnd={compositionCallback}
        onCompositionUpdate={compositionCallback}
        onCompositionStart={compositionCallback}
        className={focus ? 'focus' : ''}
        onKeyDown={() => {
            const selectionStart = builtinInputRef.current?.selectionStart
            setSelection((selection) => 
                Number.isSafeInteger(selectionStart) && selectionStart !== selection[0] 
                ? [selectionStart as number, selection[1]] 
                : selection
            )
        }}
        >
        <BuiltInInput 
            ref={builtinInputRef}  
            onInput={builtInInputChangeCallback}
            onSelect={builtInSelectionCallback}
            value={value}
            type={type}
            name={name}
        />    
        <Input ref={inputRef}
            typeof={type}
            role={'textbox'}
            
        >

            {(focus || value.length > 0) && display}
            {!focus && value.length === 0 && <PlaceHolder>{placeholder??''}</PlaceHolder>}
        </Input>
    </InputWrapper>
}

export const XInput = React.memo(XInputRaw)
XInput.displayName = 'XInput'

const BlinkAnimation = keyframes`
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
`
const BuiltInInput = styled.input`
    position: relative;
    opacity: 0;
    z-index: -1;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    font-size: inherit;
    font-family: inherit;
    pointer-events: none;
    width: 100%;
    padding: 0;
    border: none;
    grid-area:  1 / 1 / 1 / 2;
`
const InputWrapper = styled.div`
    --border-color: ${props => props.theme.XComponent?.__borderColor('input') ?? 'currentColor'};
    --color: ${props => props.theme.XComponent?.__color('input') ?? 'currentColor'};
    color: var(--color);
    font-size: 1em;
    position: relative;
    padding: ${props => props.theme.XComponent?.input?.padding ?? '.7em .7em'};
    background-color: inherit;
    border-radius: ${props => props.theme.XComponent?.__borderRadius('input') ?? '0'};
    width: auto;
    height: fit-content;
    display: grid;

    &[disabled] {
        opacity: 0.5;
        pointer-events: none;
        cursor: not-allowed;
    }

    &:after {
        content: '';
        position: absolute;
        inset: 0;
        border: 1px solid var(--border-color);
        background-color: inherit;
        z-index: -1;
        border-radius: inherit;
    }
    &.focus {
        outline: none;
        &:before {
            content: '';
            position: absolute;
            inset: -1px;
            border: 1px solid currentColor;
            z-index: -2;
            filter: blur(2px);
            border-radius: inherit;

        }
    }

`

const Input = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    height: 1.5em;
    overflow: hidden;
    background-color:  transparent;
    font-size: inherit;
    user-select: none;
    width: 100%;
    grid-area:  1 / 1 / 1 / 2;
`
const Char = styled.span`
    position: relative;
    align-items: center;
    width: fit-content;
    &.self[role="caret"] {
        opacity: 0;
        font-weight: bold;
    }

    ${InputWrapper}.focus & {
        &[role="caret"] {
            animation: ${BlinkAnimation} .2s ease-in-out infinite;
            &:before {
                content: attr(data-key);
                position: absolute;
                filter: blur(3px);
                z-index: -1;
                opacity: .5;
            }
            
            &[data-key=${props => props.theme.XComponent?.input?.space ?? '⎵'}] {
                &:before {
                    content: attr(data-key);
                    position: absolute;
                    filter: blur(0.4px);
                    z-index: -1;
                    opacity: 1;
                }
            }
        }
        &.composition {
            text-decoration: underline;
        }
        &[data-selected="true"] {
            &:after {
                content: '';
                position: absolute;
                inset: 0;
                background-color: currentColor;
                opacity: .2;
            }
        }
    }

    
`
const PlaceHolder = styled.span`
    opacity: .5;
 
`


function isCursorOffScreen (idx: number, length: number, input: HTMLElement) {
    const realSize = input.scrollWidth
    const nominalSize = input.clientWidth
    const position = realSize / length * idx 
    return input.scrollLeft > position || position > input.scrollLeft + nominalSize
}

function inputCursor2DisplayCursor(idx: number, template: string) {
    if (template === '') return idx
    let displayIndex = 0
    let matchingIdx = 0

    while (matchingIdx < idx && displayIndex < template.length) {
        
        if (template[displayIndex] === '$') {
            matchingIdx++
        }
        displayIndex++
    }
    while (displayIndex < template.length && template[displayIndex] !== '$') {
        displayIndex++
    }

    //template: $$$-$$$-$$$$
    //value:   1234
    //display: 123-4
    //m: 0, d: 0, idx: 3
    //loop1: template[0] = $ --- m: 1, d: 1
    //loop2: template[1] = $ --- m: 2, d: 2
    //loop3: template[2] = $ --- m: 3, d: 3
    //loop4: template[3] = - --- m: 3, d: 4
    //loop5: template[4] = $ --- m: 4, d: 5

    return displayIndex
}

function formatValue(value: string, template: string) {
    if (template === '') return value 

    let result = ''
    let valueIdx = 0
    let templateIdx = 0
    while (valueIdx < value.length && templateIdx < template.length) {
        if (template[templateIdx] === '$') {
            result += value[valueIdx]
            valueIdx++
            templateIdx++
        } else {
            result += template[templateIdx]
            templateIdx++
        }
    }
    return result
}

function getValueByTemplate(value: string, template: string) {
    if (template === '') return value 

    const countChars = [...template].reduce((count, c) => c === '$' ? count + 1 : count, 0)
    if (value.length > countChars) {
        return value.substring(0, countChars)
    }
    return value
}

