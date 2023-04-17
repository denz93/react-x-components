import { ButtonHTMLAttributes, useEffect, useRef, useState } from "react"
import styled, { keyframes } from "styled-components"
import { withGlowBorderEffect } from "../higher-order-components/with-glow-effect"

const Button = styled.button.attrs({type: 'button'})`
  color: ${props => props.theme.XComponent?.__color('button')};
  padding: .7em 1em;
  outline-color: transparent;
  border: 1px solid ${props => props.theme.XComponent?.__borderColor('button')};
  border-radius: ${props => props.theme.XComponent?.__borderRadius('button') ?? '0'};
  background-color: transparent;
  cursor: pointer;
  &:disabled {
    pointer-events: none;
    opacity: .5;
  }

  &:focus {
    box-shadow: 0 0 3px 1px currentColor;
    
  }

`

export const XButton = withGlowBorderEffect(Button)

