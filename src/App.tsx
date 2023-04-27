import { useState } from 'react'
import './App.css'
import { createTheme } from './ui-components/createTheme'
import {XInput} from './ui-components/inputs/xinput'
import { XDropdownInput } from './ui-components/inputs/x-dropdown-input'
import { XPhoneInput } from './ui-components/inputs/x-phone-input'
import { XForm } from './ui-components/inputs/x-form'
import { useForm } from './ui-components/hooks/useForm'
import { Validator } from './libs/validator'

const ThemeProvider = createTheme({
  // button: {
  //   borderRadius: '1em'
  // },
  global: {
    padding: '.7em 1em',
    text: 'rgba(214, 179, 113, 0.87)',
    border: {
      color: 'rgba(214, 179, 113, 0.87)',
      radius: '2em'
    }
  }
})

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const formContext = useForm({
    'Personal Info': { 
      firstName: { 
        type: 'text', 
        constraints: Validator.type('string').required().max(100) 
      }, 
      lastName: {
        type: 'text', 
        constraints: Validator.type('string').required().max(100) 
      }
    },
    'Login': { 
      email: { 
        type: 'text', 
        label: 'Email', 
        constraints: Validator
          .type('string', {regex: 'Value must be an email'})
          .required()
          .regex("^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$") 
      }
    }
  })





  const [options, setOptions] = useState({
    "1": { title: 'VueJS' },
    "2": { title: 'Javascript'},
    "3": { title: 'Java' },
    "4": { title: 'C#'},
    "5": { title: 'C++' },
    "6": { title: 'Typescript'},
    "7": { title: 'MongoDB' },
    "8": { title: 'Css'}
  })
  return (
    <ThemeProvider>
      <div className="App">
        <div style={{width: '15em'}}>
          <XInput 
            value={email} 
            type="text"
            placeholder='Your email'
            onChange={(value) => setEmail(value)}
          />
        </div>

        <div style={{width: '15em'}}>
          <XInput 
            value={password} 
            type="password"
            placeholder='Your password'
            onChange={(value) => setPassword(value)}

          />
        </div>

        <div style={{width: '15em'}}>
          <XDropdownInput 
            optionList={options} 
            placeholder='Select a option'
            optionDisplayFormater={(op) => op.title}
            optionFormater={(option) => <span>{option.title}</span>}
            optionMatchStrategy={(option, search) => option.title.match(new RegExp(search,'i')) !== null}
            />
        </div>
        
       
        <div style={{width: '15em'}}>
          <XPhoneInput 
            allowedCountries={['us', 'vn']} 
            value={phone} 
            onChange={(val) => setPhone(val)}
            defautCountryCode='us'
          />
        </div>
        
        <div>
          <XForm form={formContext} title='Form Title'/>
        </div>
      </div>
     </ThemeProvider>
    
  )
}

export default App
