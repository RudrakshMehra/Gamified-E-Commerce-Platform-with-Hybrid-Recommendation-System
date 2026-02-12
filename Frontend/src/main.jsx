import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Route, Routes, useNavigate,BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import LoginPage from './Pages/Login.jsx'
import Register from './Pages/Register.jsx'
import Services from "./Pages/Services.jsx";


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
      <Routes>

  <Route path="/" element={<App />} />

  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<Register />} />
<Route path="/services" element={<Services />} />



  {/* <Route path="/register" element={<Register />} />

  <Route path="/services" element={<Services />} />

  {/* Dashboard Layout Route */}
  {/* <Route path="/dashboard" element={<Dashboard />}>

    <Route index element={<Home />} />
    <Route path="home" element={<Home />} />
    <Route path="graphical" element={<Graphical />} />
    <Route path="period" element={<Periodic />} />
    <Route path="chd" element={<CHD_Prediction />} /> 
     */}

  {/* </Route> */}

</Routes>
  </BrowserRouter> 
  
)
