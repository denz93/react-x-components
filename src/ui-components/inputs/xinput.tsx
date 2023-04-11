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
    position: absolute;
    border: 1px solid red;
    opacity: 0;
    z-index: -1;
    left: 0;
    font-size: inherit;
    font-family: inherit;
    width: ${props => props.theme.XComponent?.input?.defaultWidth ?? '10em'};
    pointer-events: none;
`
const InputWrapper = styled.div`
    --border-color: ${props => props.theme.XComponent?.input?.borderColor ?? '#FFFFFFAA'};
    font-size: 1em;
    position: relative;
    padding: ${props => props.theme.XComponent?.input?.padding ?? '.7em .7em'};
    background-color: inherit;
    border-radius: ${props => props.theme.XComponent?.input?.borderRadius ?? '0'};

    &:after {
        content: '';
        position: absolute;
        inset: 0;
        outline: 1px solid var(--border-color);
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
            outline: 1px solid currentColor;
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
    width: ${props => props.theme.XComponent?.input?.defaultWidth ?? '10em'};
    height: 1em;
    overflow: hidden visible;
    background-color:  transparent;
    font-size: inherit;

`
const Char = styled.span`
    position: relative;
    font-weight: bolder;
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
    type: "text" | "email" | "phone" | "number"
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
    const inputRef = useRef<HTMLDivElement>(null)
    const builtinInputRef = useRef<HTMLInputElement>(null)

    const display = useMemo(() => {
        const charList = value.split('').map(c => c === ' ' ? HTML_SPACE_CHAR : c)

        return <>
            {charList.map((c, idx) => <Char
                key={idx}
                role={idx === cursor ? "caret" : ""}
                data-key={c === HTML_SPACE_CHAR ? (theme?.input?.space ?? '⎵') : c}
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
    } , [value, cursor, composition])  

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
        if (selectionStart === null) return 

        setCursor(selectionStart)
    }, [value])


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
        setCursor(val.length)
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
                builtinInputRef.current?.focus()

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
        >
        <BuiltInInput 
            ref={builtinInputRef}  
            onInput={builtInInputChangeCallback}
            onSelect={builtInSelectionCallback}
            value={value}
        />    
        <Input ref={inputRef}>
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

