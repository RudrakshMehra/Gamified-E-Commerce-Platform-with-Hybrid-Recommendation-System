import {React,useState} from 'react'
import Image from "../assets/images/login.jpg"

function LoginPage() {
const[email,setEmail]=useState("");
const[password,setPassword]=useState("");

  return (
    <div>
       {/* Login Card */}
      <div className="min-h-screen bg-zinc-900 flex justify-center items-center">

        <div className="bg-zinc-800 w-[380px] rounded-lg overflow-hidden">

          <div className="bg-indigo-500 p-6 flex justify-center">
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
              className="w-full p-2 rounded bg-zinc-700"
            />

            <input
              onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='password' require
              className="w-full p-2 rounded bg-zinc-700"
            />

            <button className="bg-indigo-500 w-full py-2 rounded">
              Login
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
