import { useState } from 'react'
import './App.css'
import { createTheme, DEFAULT_THEME } from './ui-components/createTheme'
import XInput from './ui-components/inputs/xinput'
import { XSearchInput } from './ui-components/inputs/x-search-input'

const ThemeProvider = createTheme({
  input: {
    borderRadius: '4em',

  }
})

function App() {
  const [email, setEmail] = useState('')
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
        <XInput 
          value={email} 
          type="email"
          placeholder='Your email'
          onChange={(value) => setEmail(value)}
        />
        <XInput 
          value={email} 
          type="phone"
          placeholder='Your phone'
        />
        <XSearchInput 
          optionList={options} 
          placeholder='Select a option'
          optionDisplayFormater={(op) => op.title}
          optionFormater={(option) => <span>{option.title}</span>}
          optionMatchStrategy={(option, search) => option.title.match(new RegExp(search,'i')) !== null}
          />
      </div>
    </ThemeProvider>
    
  )
}

export default App
