import styled from "styled-components"
import XInput from "./xinput"
import { useCallback, useRef, useState } from "react"

const Main = styled.div`
  position: relative;
`

const FloatSection = styled.div<{shouldShow: boolean}>`
  position: absolute;
  display: flex;
  flex-direction: column;
  padding: .7em 1.5em;
  overflow: hidden;
  transition: filter .3s ease-in-out, transform .1s ease-in-out;
  filter: blur(10px) ;
  transform: scale(0);
  ${props => props.shouldShow && `
    filter: blur(0) ;
    transform: scale(1);
  `}
`
const Option = styled.div`
  position: relative;
  cursor: pointer;
  user-select: none;
  display: flex;
  gap: 1em;
  flex-basis: fit-content;
  flex-wrap: wrap;
  &:after {
    content: '✔';
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1em;
    height: 1em;
    transition: opacity .2s ease-in-out, transform .4s ease-in-out;
    border-radius: 0;
    opacity: 0;
    top: 50%;
    left: -1.5em;
    border: 1px solid currentColor;
    transform: translateY(-50%) scale(0);
    border-radius: 10em;

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
  onOptionSelected: (option: T) => void 
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

export function XSearchInput<T>({
  optionFormater = defaultOptionFormater<T>, 
  optionDisplayFormater = defaultOptionDisplayFormater<T>,
  optionMatchStrategy = defaultOptionMatchStrategy<T>,
  optionList, 
  ...props}: Partial<IXSearchInputProps<T>>
  ) {
  const [inputFocus, setInputFocus] = useState(false)
  const [optionFocus, setOptionFocus] = useState(false)
  const [selectedOption, setSelectedOption] = useState<T|null>(null)
  const [searchValue, setSearchValue] = useState('')
  const floatSectionRef = useRef<HTMLDivElement>(null)
  const focus = inputFocus || optionFocus

  const filteredOptionList = 
    Array.isArray(optionList) 
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
    : []
  const searchValueChangeCallback = useCallback((val: string) => {
    setSearchValue(val)
    
  }, [])
  return <Main
    tabIndex={0}
    onBlurCapture={(ev) => {
      if (ev.relatedTarget === floatSectionRef.current) {
        setOptionFocus(true)
      } else {
        setOptionFocus(false)
      }
    }}
    
  >
    <XInput 
      placeholder={props.placeholder}
      value={
        focus 
        ? searchValue 
        : selectedOption !== null
        ? optionDisplayFormater(selectedOption)
        : undefined
      }
      onChange={searchValueChangeCallback}
      onFocus={() => { setInputFocus(true);}}
      onBlur={() => {
        setInputFocus(false)
        return optionFocus
      }}
      />
    <Arrow data-up={focus}>▼</Arrow>

    <FloatSection 
      ref={floatSectionRef}
      shouldShow={focus} 
      tabIndex={0}
      onFocus={() => { setOptionFocus(true); setInputFocus(true); console.log(`Float Section focus`)}}
      onBlur={() => setOptionFocus(false)}
      >
      { filteredOptionList.map((option, idx) => 
        <Option 
          key={idx}
          onClick={() => { selectedOption !== option ? setSelectedOption(option) : setSelectedOption(null); }}
          data-selected={option === selectedOption}
        >
          {optionFormater(option)}
        </Option>)
      }
      {filteredOptionList.length === 0 && <span>No option matched "{searchValue}"</span>}
    </FloatSection>
  </Main>
}