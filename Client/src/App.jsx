import { useContext, useEffect, useState, lazy, Suspense } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Landing from "./Components/LandingPage"
import Login from "./Components/LoginPage"
import Register from "./Components/Register"
import Dashboard from './Components/Dashboard'
import Home from "./Pages/home"
import Graphical from './Pages/Graphical'
import Periodic from "./Pages/PeriodicalHealthData"
import CHD_Prediction from './Pages/CHD_Prediction'



export default function App() {
  return (
    <div className="bg-zinc-900 min-h-screen text-white">
    {/* <Landing/>
    <Login/> */}
   <Routes>

  <Route path="/" element={<Landing />} />

  <Route path="/login" element={<Login />} />

  <Route path="/register" element={<Register />} />

  {/* Dashboard Layout Route */}
  <Route path="/dashboard" element={<Dashboard />}>

    <Route index element={<Home />} />
    <Route path="home" element={<Home />} />
    <Route path="graphical" element={<Graphical />} />
    <Route path="period" element={<Periodic />} />
    <Route path="chd" element={<CHD_Prediction />} />
    



  </Route>

</Routes>

    {/* <Signup/> */}


    
    </div>
  );
}
