import {React,useState} from 'react'
import { useNavigate } from "react-router-dom";
import Image from "../assets/images/login.jpg"
import backgroundImage from "../assets/images/background3.jpg";


function LoginPage() {
  const navigate = useNavigate();
const[email,setEmail]=useState("");
const[password,setPassword]=useState("");

  return (
    <div>
       {/* Login Card */}
      <div className="min-h-screen flex justify-center items-center bg-cover" style={{ backgroundImage: `url(${backgroundImage})` }}>

        <div className="bg-zinc-300 w-[380px] rounded-lg overflow-hidden">

          <div className="bg-gradient-to-br from-cyan-300 to-sky-800 p-6 flex justify-center">
  <div className="w-20 h-20 bg-white rounded-full overflow-hidden flex items-center justify-center">
    <img
      src={Image}
      alt="avatar"
      className="w-full h-full object-cover"
    />
  </div>

</div>

          <div className="p-6 space-y-4">
            
            <input
              onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Email' require
              className="w-full p-2 rounded bg-white"
            />

            <input
              onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='password' require
              className="w-full p-2 rounded bg-white"
            />

            <button className="bg-gradient-to-br from-cyan-300 to-sky-800 w-full py-2 rounded">
              Login
            </button>
            <p
            className="text-center text-sm text-indigo-800 cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Don't have an account? Register
          </p>

          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
