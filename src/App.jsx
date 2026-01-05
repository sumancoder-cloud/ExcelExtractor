import { useState } from 'react'
import LandingPage from './Pages/LandingPage'
import LoginPage from './Pages/LoginPage'
import SignupPage from './Pages/SignupPage'
import MainPage from './Pages/MainPage'
import PageNotFound from './Pages/PageNotFound'
import {Routes,Route} from "react-router-dom"
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Routes>
      <Route path='/' element={<LandingPage />}/> 
      <Route path='/login' element={<LoginPage />} />
      <Route path='/signUp' element={<SignupPage />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="*" element={<PageNotFound/>} />
    </Routes>
    </>
  )
}

export default App
