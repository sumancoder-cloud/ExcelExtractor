import { useState } from 'react'
import LandingPage from './Pages/LandingPage'
import LoginPage from './Pages/LoginPage'
import SignupPage from './Pages/SignupPage'
import {Routes,Route} from "react-router-dom"
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Routes>
      <Route path='/' element={<LandingPage />}/> 
      <Route path='/login' element={<LoginPage />} />
      <Route path='/signUp' element={<SignupPage />} />
    </Routes>
    </>
  )
}

export default App
