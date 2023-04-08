import './App.css'
import { createTheme, DEFAULT_THEME } from './ui-components/createTheme'
import XInput from './ui-components/inputs/xinput'

const ThemeProvider = createTheme()

function App() {

  return (
    <ThemeProvider>
      <div className="App">
        <XInput/>
      </div>
    </ThemeProvider>
    
  )
}

export default App
