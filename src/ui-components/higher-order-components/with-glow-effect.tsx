import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import styled, {StyledComponentProps, StyledProps, keyframes } from "styled-components"

export interface IGlowBorderEffectProps<FC extends React.FunctionComponent<{children?: ReactNode}>> {
  fc: FC
}
type ISupportedFC = React.FunctionComponent<any>
type IInstrinsicTag = keyof JSX.IntrinsicElements
type IWithGlowBorderEffectParam = ISupportedFC | IInstrinsicTag
type PropsOfFunctionComponent<T extends ISupportedFC> = T extends React.FunctionComponent<infer Props> ? Props: never
type IInstrinsicElement<T extends IInstrinsicTag> = JSX.IntrinsicElements[T]
export type IGlowBorderEffectReturn<TParam extends IWithGlowBorderEffectParam> = TParam extends ISupportedFC ? React.FunctionComponent<PropsOfFunctionComponent<TParam>> : TParam extends IInstrinsicTag ? React.ForwardRefExoticComponent<IInstrinsicElement<TParam>>: never

const EffectWrapper = styled.svg`
--wrapper-offset: 20px;
--effect-width: 15px;
--effect-dashoffset: 110px;

pointer-events: none;
position: absolute;
width: calc(100% + 2 * var(--wrapper-offset));
height: calc(100% + 2 * var(--wrapper-offset));
left: calc(-1 * var(--wrapper-offset) );
top: calc(-1 * var(--wrapper-offset));
`
const GlowVisibility = keyframes`
  0%, 100% {
    opacity: 0;
  }
  25%, 75% {
    opacity: 1;
  }
`

export function withGlowBorderEffect<TParam extends IWithGlowBorderEffectParam>(fc: TParam): IGlowBorderEffectReturn<TParam> {
  const Main =  styled('div')`
    position: relative;
    
  `

  //@ts-ignore
  const EffectLine = styled.rect.attrs({pathLength: 100})`
    position: absolute;
    fill: transparent;
    stroke: ${props => props.theme.XComponent?.__borderColor('button') ?? 'currentColor'};
    /* stroke: white; */
    stroke-dasharray: var(--effect-width) calc(50px - var(--effect-width));
    stroke-width: 1px;
    x: var(--wrapper-offset);
    y: var(--wrapper-offset);
    width: calc(100% - 2 * var(--wrapper-offset));
    height: calc(100% - 2 * var(--wrapper-offset));
    stroke-dashoffset: 0;
    opacity: 0;
    ${Main}:hover &, ${Main}:focus, ${Main}:focus-within & {
      animation: ${GlowVisibility} 2s ease-in-out;
      transition: stroke-dashoffset 2s ease-in-out;
      stroke-dashoffset: var(--effect-dashoffset);
    }

    &[data-blur="true"] {
      filter: blur(3px);
      z-index: -1;
    }
  `

  //@ts-ignore
  return typeof fc === 'function' ? function (props: TParam extends ISupportedFC ? PropsOfFunctionComponent<TParam> : never) {
    const ref = useRef<HTMLDivElement>(null)
    const [rx, setRx] = useState('0')
    useEffect(() => {
      if (!ref.current || !ref.current.firstElementChild) return
      const rx = getComputedStyle(ref.current.firstElementChild).borderRadius
      setRx(rx)
    }, [])
    //@ts-ignore
    
    return <Main ref={ref}>
      {fc(props)}
      <EffectWrapper>
        <EffectLine rx={rx}></EffectLine>
        <EffectLine rx={rx} data-blur="true"></EffectLine>
      </EffectWrapper>
    </Main>
  }
  : React.forwardRef(({children, ...props}: TParam extends IInstrinsicTag ? IInstrinsicElement<TParam> : never, forwardRef) => {
      const ref = useRef<HTMLDivElement>(null)
      const [rx, setRx] = useState('0')

      useEffect(() => {
        if (!ref.current || !ref.current.firstElementChild) return
        const rx = getComputedStyle(ref.current.firstElementChild).borderRadius
        setRx(rx)
      }, [])
      return <Main ref={ref}>
        {React.createElement(fc, {...props, ref: forwardRef}, children)}
        <EffectWrapper>
          <EffectLine rx={rx}></EffectLine>
          <EffectLine rx={rx} data-blur="true"></EffectLine>
        </EffectWrapper>
      </Main>
  })
}

