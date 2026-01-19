import { useState } from 'react'
import LandingPage from './Pages/LandingPage'
import LoginPage from './Pages/LoginPage'
import MainPage from './Pages/MainPage'
import PageNotFound from './Pages/PageNotFound'
import ProtectedRoute from './Components/ProtectedRoute'
import SecurityWrapper from './Components/SecurityWrapper'
import ForgotPasswordPage from './Pages/ForgotPasswordPage'
import ResetPasswordPage from './Pages/ResetPasswordPage'
import ProfilePage from './Pages/ProfilePage'
import ConversionHistoryPage from './Pages/ConversionHistoryPage'
import {Routes,Route} from "react-router-dom"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Routes>
      <Route path='/' element={<LandingPage />}/>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/forgot-password' element={<ForgotPasswordPage />} />
      <Route path='/reset-password' element={<ResetPasswordPage />} />
      <Route path="/main" element={
        <ProtectedRoute>
          <SecurityWrapper>
            <MainPage />
          </SecurityWrapper>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute>
          <ConversionHistoryPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<PageNotFound/>} />
    </Routes>
    </>
  )
}

export default App
