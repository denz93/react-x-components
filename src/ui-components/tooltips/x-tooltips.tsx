import styled, { StyledComponentProps, StyledComponentPropsWithRef, StyledProps } from "styled-components"
import { XTheme } from "../interfaces"
import { useEffect, useRef, useState } from "react"
type TypeByKeyPath<T, TPath extends string> = 
  TPath extends `${(infer X)}.${(infer Rest)}` 
  ? X extends keyof T ? TypeByKeyPath<NonNullable<T[X]>,Rest> : never
  : TPath extends keyof T ? NonNullable<T[TPath]> : never

type TooltipType<TTheme extends XTheme> = TypeByKeyPath<TTheme, 'global.color'>

export interface ITooltipProps {
  message?: string
  title?: string
  type?: keyof TooltipType<XTheme>
  defaultShowed?: boolean
}

export function XTooltip({
  title,
  message, 
  defaultShowed = false,
  type = 'primary',
  ...props

}: ITooltipProps) {
  const [isShow, setIsShow] = useState(defaultShowed)
  const mainRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() =>{
    const ele = contentRef.current as NonNullable<typeof contentRef.current>
    const rect = ele.getBoundingClientRect()
    let offsetLeft = 0
    if (rect.right > window.document.body.clientWidth) {
      offsetLeft = rect.right - window.document.body.clientWidth + 30
    }
    if (offsetLeft > 0) {
      ele.style.transform = `translate(${-offsetLeft}px, calc(-100% - 1em))`
    }
  }, [])

  return <Tooltip 
    {...props}
    ref={mainRef}
    type={type} 
    
    >
    <Icon 
      tabIndex={0}
      data-is-show={true}
      onFocus={() => setIsShow(true)}
      onBlur={() => setIsShow(false)}
      
      >ⓘ</Icon>
    <Content 
      ref={contentRef}
      data-is-show={isShow}
    >
      <Title>{title}</Title>
      {message}
    </Content>
    
  </Tooltip>
}
const Tooltip = styled.div<{type: NonNullable<ITooltipProps['type']>}>`
  --color: ${props => props.theme.XComponent?.global?.color?.[props.type]??'currentColor'};
  --bg: ${props => props.theme.XComponent?.global?.background};

  position: absolute;

  color: var(--color);
  z-index: 10;
`

const Content = styled.div`
  position: absolute;
  display: block;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  left: 2em;
  transition: opacity .4s ease-in-out;
  &[data-is-show="true"] {
    opacity: 1;
  }
  z-index: 9;
  pointer-events: none;
  background: var(--bg);
  padding: .7em 1em;
  box-shadow: 0 0 4px 1px var(--color);
`

const Title = styled.span`
  font-weight: bolder;
`

const Icon = styled.div`
  position: absolute;
  display: none;  
  &[data-is-show="true"] {
    display: inline-block;
  }
  z-index: 10;
  user-select: none;
  cursor: pointer;
`