import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useXTheme } from '../createTheme';
const HTML_SPACE_CHAR = '&nbsp;';
const BlinkAnimation = keyframes `
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
`;
const BuiltInInput = styled.input `
    position: absolute;
    border: 1px solid red;
    opacity: 0;
    z-index: -1;
    left: 0;
    font-size: inherit;
    font-family: inherit;
    width: ${props => props.theme.XComponent?.input?.defaultWidth ?? '10em'};
`;
const InputWrapper = styled.div `
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

`;
const Input = styled.div `
    position: relative;
    display: flex;
    align-items: center;
    width: ${props => props.theme.XComponent?.input?.defaultWidth ?? '10em'};
    min-height: 1em;
    height: max-content;
    overflow: hidden visible;
    background-color:  transparent;
    font-size: inherit;

`;
const Char = styled.span `
    position: relative;
    &.self[role="caret"] {
        opacity: 0;
    }

    ${InputWrapper}:focus &, ${BuiltInInput}:focus + ${Input} & {
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
`;
export default function XInput() {
    const theme = useXTheme();
    const [value, setValue] = useState('');
    const [cursor, setCursor] = useState(0);
    const [composition, setComposition] = useState(null);
    const [focus, setFocus] = useState(false);
    const inputRef = useRef(null);
    const builtinInputRef = useRef(null);
    const charList = value.split('').map(c => c === ' ' ? HTML_SPACE_CHAR : c);
    const display = _jsxs(_Fragment, { children: [charList.map((c, idx) => _jsx(Char, { role: idx === cursor ? "caret" : "", "data-key": c === HTML_SPACE_CHAR ? (theme?.input?.space ?? '⎵') : c, className: idx === composition ? "composition" : "", dangerouslySetInnerHTML: { __html: c } }, idx)), charList.length === cursor && _jsx(Char, { role: "caret", className: 'self', "data-key": "_", children: theme?.input?.caret ?? '_' })] });
    const compositionCallback = useCallback((event) => {
        console.log(`Composition event: ${event.type} - "${event.data}"`);
        switch (event.type) {
            case 'compositionstart':
                setComposition(value.length);
                break;
            case 'compositionend':
                setComposition(null);
                break;
        }
    }, [value, composition, cursor]);
    useEffect(() => {
        if (!inputRef.current)
            return;
        if (isCursorOffScreen(cursor, value.length, inputRef.current)) {
            const input = inputRef.current;
            const realSize = input.scrollWidth;
            const nominalSize = input.clientWidth;
            const position = realSize / value.length * cursor;
            input.scrollLeft = position;
        }
    }, [cursor, value]);
    return _jsxs(InputWrapper, { tabIndex: 0, onBlur: () => setComposition(null), onClick: () => builtinInputRef.current?.focus(), onFocus: () => builtinInputRef.current?.focus(), onCompositionEnd: compositionCallback, onCompositionUpdate: compositionCallback, onCompositionStart: compositionCallback, className: focus ? 'focus' : '', children: [_jsx(BuiltInInput, { ref: builtinInputRef, onChange: (event) => { setValue(event.target.value); }, onSelect: (event) => {
                    setCursor(event.currentTarget.selectionStart ?? 0);
                }, onFocus: () => setFocus(true), onBlur: () => setFocus(false) }), _jsx(Input, { ref: inputRef, children: display })] });
}
function isCursorOffScreen(idx, length, input) {
    const realSize = input.scrollWidth;
    const nominalSize = input.clientWidth;
    const position = realSize / length * idx;
    return input.scrollLeft > position || position > input.scrollLeft + nominalSize;
}
