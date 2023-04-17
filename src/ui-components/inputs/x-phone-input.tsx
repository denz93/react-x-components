import styled from "styled-components";
import {XInput} from "./xinput";
import { FloatSection, Option, XSearchInput } from "./x-search-input";
import { CountryCodeType, CountryDialMap, CountryType } from "../../libs/coutntry-dial-map";
import { useEffect, useMemo, useState } from "react";
import { IXBaseInputProps } from "../interfaces";

export type IFlagOption = CountryType

export interface IXPhoneInputProps extends IXBaseInputProps<string> {
    defautCountryCode: CountryCodeType
    allowedCountries: CountryCodeType[]
    phoneTemplate: string
}
export function XPhoneInput ({
    allowedCountries = [],
    phoneTemplate = '',
    value,
    onChange,
    ...props}: Partial<IXPhoneInputProps>) {
    const [countryCode, setCountryCode] = useState(props.defautCountryCode??null)
    const [phonenumber, setPhonenumber] = useState('')
    const [countryList, setCountryList] = useState<CountryType[]>([])
    
    const selectedCountryOption = useMemo(
        () => flagOptions.find(o => o.code.toLowerCase() === countryCode?.toLowerCase()) ?? flagOptions[0], 
        [countryCode]) 
    
    useEffect(() => {
        if (typeof props.defautCountryCode === 'string') {
            setCountryCode(props.defautCountryCode)
            return
        } 

        const localCountryCode = getLocalCountryCode()

        setCountryCode(localCountryCode)

    }, [props.defautCountryCode])

    useEffect(() => {
        const newValue = value ?? ''

        setPhonenumber(newValue.replace(selectedCountryOption.dial_code, ''))
    }, [value])

    useEffect(() => {
        if (allowedCountries.length === 0) {
            setCountryList(flagOptions)
        } else {
            setCountryList(
                flagOptions.filter(country => allowedCountries.includes(country.code.toLowerCase() as any))
            )
        }
    }, [allowedCountries])

    return <Main {...props} >
        <Flag 
            optionList={countryList}
            defaultOption={selectedCountryOption}
            optionFormater={(option) => `${option.emoji} ${option.dial_code} ${option.name}`}
            optionDisplayFormater={option => `${option.dial_code}`}
            optionMatchStrategy={({dial_code, name, code}, value) => 
                code.toLowerCase().includes(value.toLowerCase())
                || dial_code.toLowerCase().includes(value.toLowerCase()) 
                || name.toLowerCase().includes(value.toLowerCase())
            }
            onOptionSelected={(option) => { 
                const newOptionCode = option?.code.toLowerCase() as any
                setCountryCode(newOptionCode)
                const newPhonenumber = (option?.dial_code ?? '') + phonenumber 
                onChange && onChange(newPhonenumber)
            }}
        />
        <Number 
            displayTemplate={phoneTemplate}
            placeholder={props.placeholder ?? 'Phone number'}
            onChange={(value) => {
                const newPhonenumber = selectedCountryOption.dial_code + value
                setPhonenumber(value)
                onChange && onChange(newPhonenumber)
            }}
            value={phonenumber}
        />
    </Main>
}

const flagOptions: Array<IFlagOption> = Object.values(CountryDialMap)

const Main = styled.div`
    position: relative;
    display: grid;
    gap: .5em;
    width: 100%;
    grid-template-columns: 3fr 6fr;
`

const Flag = styled(XSearchInput<IFlagOption>)`
   ${FloatSection} {
    width: 250%;
    gap: 1em;
    ${Option} {
        display: inline-block;
        text-align: left;
        text-overflow: hidden;
    }
   }
`

const Number = styled(XInput)`
`

function getLocalCountryCode (): CountryCodeType | null {
    const localCountryCode = navigator.language.split('-')[1]
    if (localCountryCode.length !== 2) return null 
    return localCountryCode.toLowerCase() as CountryCodeType
}