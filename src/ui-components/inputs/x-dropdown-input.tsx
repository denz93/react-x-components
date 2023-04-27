import styled from "styled-components"
import {XInput} from "./xinput"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import React from 'react'

const Main = styled.div`
  position: relative;
  width: 100%;
  color: ${props => props.theme.XComponent?.__color('input')??'currentColor'};
`

export const FloatSection = styled.div`
  background-color: ${props => props.theme.XComponent?.global?.background??'transparent'};
  position: absolute;
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  padding: .7em 1em;
  gap: 1em;
  transition: filter .3s ease-in-out, transform .5s ease-in-out;
  filter: blur(10px) ;
  inset:0;
  height: 10em;
  top: calc(100% + 1em);
  transform: scale(0);
  overflow: hidden scroll;
  box-shadow: 0 0  5px 1px currentColor;
  z-index: 10;
  transition: filter .2s ease-in-out, transform .4s ease-in-out;
  transform-origin: 50% 0%;
  &[data-should-show="true"] {  
    filter: blur(0) ;
    transform: scale(1);
    transition: filter .5s ease-in-out, transform .4s ease-in-out;
  }

  &:before, &:after {
    content: '--- Option List ---';
    display: block;
    opacity: .4;
    font-weight: bolder;
    text-transform: capitalize;
  }

  &:after {
    content: '--- end ---';
  }

`
export const Option = styled.div`
  position: relative;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 1em;
  flex-basis: fit-content;
  flex-wrap: wrap;
  &:after {
    content: '✔';
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1em;
    height: 1em;
    transition: opacity .2s ease-in-out, transform .4s ease-in-out;
    border-radius: 0;
    opacity: 0;
    top: 50%;
    left: -1.2em;
    border: 1px solid currentColor;
    transform: translateY(-50%) scale(0);
    border-radius: 10em;
    scale: .8;
  }
  &[data-selected="true"] {
    filter: brightness(1.4);
    font-weight: bolder;
    &:after {
      
      transform: translateY(-50%) scale(1);
      opacity: 1;
    }
    
  } 
`

const Arrow = styled.span`
  position: absolute;
  width: 1em;
  height: 1em;
  line-height: 1.5em;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%;
  right: 0.5em;
  transform: translateY(-50%);
  transition: transform .4s ease-in-out;
  cursor: pointer;
  pointer-events: none;
  opacity: .2;
  transform-origin: center center;
  &[data-up="true"] {
    transform: translateY(-50%) rotate(180deg);
    opacity: 1;
  }
`

export interface IXSearchInputProps<T> {
  optionList: T[] | {[id: string | symbol | number]: T}
  optionFormater: (optionItem: T) => string | JSX.Element
  optionDisplayFormater: (optionItem: T) => string
  optionMatchStrategy: (option: T, searchValue: string) => boolean
  defaultOption: T
  placeholder: string 

  onSearchChanged: (value: string) => void 
  onOptionSelected: (option: T | null) => void 
}
const defaultOptionFormater = <T,>(option: T) => {
  return String(option)
}
const defaultOptionDisplayFormater = <T,>(option: T) => {
  return String(option)
}
const defaultOptionMatchStrategy = <T,>(option: T, searchValue: string) => {
  return String(option).toLowerCase().includes(searchValue.toLowerCase())
}

export function XDrowdownInputRaw<T>({
  optionFormater = defaultOptionFormater<T>, 
  optionDisplayFormater = defaultOptionDisplayFormater<T>,
  optionMatchStrategy = defaultOptionMatchStrategy<T>,
  optionList,
  onOptionSelected,
  placeholder,
  defaultOption,
  ...props}: Partial<IXSearchInputProps<T>>
  ) {
  const [inputFocus, setInputFocus] = useState(false)
  const [optionFocus, setOptionFocus] = useState(false)
  const [selectedOption, setSelectedOption] = useState<T|null>(defaultOption??null)
  const [searchValue, setSearchValue] = useState('')
  const floatSectionRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const focus = inputFocus || optionFocus
  
  const filteredOptionList = useMemo(() => Array.isArray(optionList) 
    ? optionList?.filter(option => {
      try {
        return optionMatchStrategy(option, searchValue)
      } catch(err) {
        return false
      }
    })
    : typeof optionList === 'object' 
    ? Object.values(optionList).filter((option) => {
      try {
        return optionMatchStrategy(option, searchValue)
      } catch(err) {
        return false
      }
    })
    : [], 
  [optionList, optionMatchStrategy, searchValue])
    
  const searchValueChangeCallback = useCallback((val: string) => {
    setSearchValue(val)
    
  }, [])

  useEffect(() => {
    setSelectedOption(defaultOption ?? null)
  }, [defaultOption])
  return <Main
    {...props}
    ref={mainRef}
    // onBlurCapture={(ev) => {
    //   if (ev.relatedTarget === mainRef.current || ev.relatedTarget === floatSectionRef.current) {
    //     setInputFocus(true)
    //     setOptionFocus(true)
    //   } else {
    //     setInputFocus(false)
    //     setOptionFocus(false)
    //   }
    // }}
  >
    <XInput 
      placeholder={placeholder}
      value={
        focus 
        ? searchValue 
        : selectedOption !== null && searchValue !== undefined
        ? optionDisplayFormater(selectedOption)
        : undefined
      }
      onChange={searchValueChangeCallback}
      onFocus={() => { setInputFocus(true);}}
      onBlur={() => {
        setInputFocus(false)
      }}
      />
    <Arrow data-up={focus}>▼</Arrow>

    <FloatSection 
      ref={floatSectionRef}
      data-should-show={focus}
      role={'listbox'}
      tabIndex={0}
      onFocus={() => setOptionFocus(true)}
      onBlur={() => setOptionFocus(false)}
      >
      { filteredOptionList.map((option, idx) => 
        <Option 
          key={idx}
          role={'listitem'}
          onClick={() => { 
            const newOption = selectedOption !== option ? option : null
            setSelectedOption(newOption)
            onOptionSelected && onOptionSelected(newOption)
          }}
          data-selected={option === selectedOption}
        >
          {optionFormater(option)}
        </Option>)
      }
      {filteredOptionList.length === 0 && <span role={'listitem'}>No option matched "{searchValue}"</span>}
    </FloatSection>
  </Main>
}

export const XDropdownInput = React.memo(XDrowdownInputRaw) as typeof XDrowdownInputRaw
//@ts-ignore
XDropdownInput.displayName = 'XDropdownInput'
