import styled from "styled-components";
import XInput from "./xinput";
import { FloatSection, XSearchInput } from "./x-search-input";


export type IFlagOption = {code: string, name: string}

export function XPhoneInput () {
    return <Main>
        <Flag 
            optionList={flagOptions}
            defaultOption={flagOptions[0]}
            optionFormater={(option) => `${option.code} ${option.name}`}
            optionDisplayFormater={option => option.code}
            optionMatchStrategy={({code, name}, value) => 
                code.toLowerCase().includes(value.toLowerCase()) 
                || name.toLowerCase().includes(value.toLowerCase())
            }
        />
        <Number />
    </Main>
}

const flagOptions: Array<IFlagOption> = [
    { code: '+1', name: 'United States'},
    { code: '+84', name: 'Vietnam'}
]

const Main = styled.div`
    position: relative;
    display: grid;
    gap: .5em;
    width: 100%;
    grid-template-columns: 2fr 5fr;
`

const Flag = styled(XSearchInput<IFlagOption>)`
   ${FloatSection} {
    width: 300%;
   }
`

const Number = styled(XInput)`
`

