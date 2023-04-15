import React, { ChangeEvent, FormEvent, SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useCallback } from 'react'
import styled, { keyframes, useTheme } from 'styled-components'
import { useXTheme } from '../createTheme'

const HTML_SPACE_CHAR = '&nbsp;'



export interface IXInputProps  {
    onClick: () => void 
    onFocus: () => void 
    /**
     * 
     * @returns true if you want to re-focus 
     */
    onBlur: () => void | boolean
    onChange: (value: string) => void 
    value: string 
    placeholder: string
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
    maxLen: number 
    minLen: number
}


export default function XInput ({
    placeholder = '', 
    type = 'text',
    displayTemplate = '',
    ...props
    }: Partial<IXInputProps>) {

    const theme = useXTheme()
    const [value, setValue] = useState('')
    const [cursor, setCursor] = useState(0)
    const [composition, setComposition] = useState<number | null>(null)
    const [focus, setFocus] = useState(false)
    const [selection, setSelection] = useState<[number, number]>([0,0])
    const inputRef = useRef<HTMLDivElement>(null)
    const builtinInputRef = useRef<HTMLInputElement>(null)

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
        charList = type === 'password' ? charList.map(c => '*') : charList
       
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
    } , [displayValue, composition, displaySelection, displayCursor, displayTemplate])  

    const compositionCallback = useCallback((event: React.CompositionEvent) => {
        switch(event.type) {
            case 'compositionstart':
                setComposition(value.length)
                break;
            case 'compositionend':
                setComposition(null)
                break;
           
        }
    }, [value, composition, cursor])

    const builtInInputChangeCallback = useCallback((event: FormEvent<HTMLInputElement>) => {
        setValue(event.currentTarget.value);
        props.onChange && props.onChange(getValueByTemplate(event.currentTarget.value, displayTemplate))
    }, [props.onChange, displayTemplate])

    const builtInSelectionCallback = useCallback((event: SyntheticEvent<HTMLInputElement>) => {
        const {selectionStart, selectionEnd} = event.currentTarget
        if (selectionStart != selection[0] || selectionEnd != selection[1]) {
            setSelection([selectionStart??0, selectionEnd??0])
            
            event.currentTarget.offsetLeft
        }

        if (selectionStart === null) return 
        setCursor(selectionStart)

        
    }, [value, selection])


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
        const val = typeof props.value !== 'string' ? '' : props.value;
        setValue(val)
    }, [props.value])

    useEffect(() => {
        if (focus)
            builtinInputRef.current?.focus()
    }, [focus])

    return <InputWrapper 
        tabIndex={0} 
        onBlur={() => {
            const forceFocus = props.onBlur && props.onBlur()
            if (forceFocus) {
                setTimeout(() => {builtinInputRef.current?.focus()}, 1)
            } else {
                setComposition(null)
                setFocus(false)
            }
        }}
        onClick={() => {
            props.onClick && props.onClick()
        }}
        onFocus={() => {
            setFocus(true);
            props.onFocus && props.onFocus()
        }}
        onCompositionEnd={compositionCallback}
        onCompositionUpdate={compositionCallback}
        onCompositionStart={compositionCallback}
        className={focus ? 'focus' : ''}
        onKeyDown={() => setCursor(builtinInputRef.current?.selectionStart??0)}
        >
        <BuiltInInput 
            ref={builtinInputRef}  
            onInput={builtInInputChangeCallback}
            onSelect={builtInSelectionCallback}
            onBlur={() => { setFocus(false)}}
            value={value}
            type={type}
            name={type}
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
    --border-color: ${props => props.theme.XComponent?.input?.borderColor ?? '#FFFFFFAA'};
    --color: ${props => props.theme.XComponent?.input?.color ?? 'currentColor'};
    color: var(--color);
    font-size: 1em;
    position: relative;
    padding: ${props => props.theme.XComponent?.input?.padding ?? '.7em .7em'};
    background-color: inherit;
    border-radius: ${props => props.theme.XComponent?.input?.borderRadius ?? '0'};
    width: auto;
    height: fit-content;
    display: grid;

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

