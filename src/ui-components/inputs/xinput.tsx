import React, { ChangeEvent, FormEvent, SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useCallback } from 'react'
import styled, { keyframes, useTheme } from 'styled-components'
import { useXTheme } from '../createTheme'

const HTML_SPACE_CHAR = '&nbsp;'

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
    font-size: 1em;
    position: relative;
    padding: ${props => props.theme.XComponent?.input?.padding ?? '.7em .7em'};
    background-color: inherit;
    border-radius: ${props => props.theme.XComponent?.input?.borderRadius ?? '0'};
    width: auto;
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
}


export default function XInput ({
    placeholder = '', 
    type = 'text',
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

    const display = useMemo(() => {
        let charList = value.split('').map(c => c === ' ' ? HTML_SPACE_CHAR : c)
        charList = type === 'password' ? charList.map(c => '*') : charList
        const hasSelection = selection[0] !== selection[1]

        return <>
            {charList.map((c, idx) => <Char
                key={idx}
                role={idx === cursor ? "caret" : ""}
                data-key={c === HTML_SPACE_CHAR ? (theme?.input?.space ?? '⎵') : c}
                data-selected={idx >= selection[0] && idx < selection[1]}
                className={idx === composition ? "composition" : ""}
                dangerouslySetInnerHTML={{__html: c}}
            />)}
            {charList.length <= cursor && <Char 
                role="caret" 
                className='self'
                data-key="_"
                >
                    {theme?.input?.caret ?? '_'}
                </Char>}
        </>
    } , [value, cursor, composition, selection])  

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
        props.onChange && props.onChange(event.currentTarget.value)
    }, [props.onChange])

    const builtInSelectionCallback = useCallback((event: SyntheticEvent<HTMLInputElement>) => {
        const {selectionStart, selectionEnd} = event.currentTarget
        if (selectionStart != selection[0] || selectionEnd != selection[1]) {
            setSelection([selectionStart??0, selectionEnd??0])
            
            event.currentTarget.offsetLeft
        }
        console.log({selectionStart, selectionEnd})

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
        const val = props.value ?? '';
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

function isCursorOffScreen (idx: number, length: number, input: HTMLElement) {
    const realSize = input.scrollWidth
    const nominalSize = input.clientWidth
    const position = realSize / length * idx 
    return input.scrollLeft > position || position > input.scrollLeft + nominalSize
}

