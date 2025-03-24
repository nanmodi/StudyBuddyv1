import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Aiapp from './components/Aiapp'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
       <Aiapp></Aiapp>
  
    </>
  )
}

export default App
