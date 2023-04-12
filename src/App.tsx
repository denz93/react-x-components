import { useState } from 'react'
import './App.css'
import { createTheme, DEFAULT_THEME } from './ui-components/createTheme'
import XInput from './ui-components/inputs/xinput'
import { XSearchInput } from './ui-components/inputs/x-search-input'
import { XPhoneInput } from './ui-components/inputs/x-phone-input'

const ThemeProvider = createTheme({
  input: {
    borderRadius: '10em',

  }
})

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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
          <XSearchInput 
            optionList={options} 
            placeholder='Select a option'
            optionDisplayFormater={(op) => op.title}
            optionFormater={(option) => <span>{option.title}</span>}
            optionMatchStrategy={(option, search) => option.title.match(new RegExp(search,'i')) !== null}
            />
        </div>
        
       
        <div style={{width: '15em'}}>
          <XPhoneInput/>
        </div>
          
      </div>
    </ThemeProvider>
    
  )
}

export default App
