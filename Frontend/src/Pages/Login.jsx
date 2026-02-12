import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import Image from "../assets/images/login.jpg";
import backgroundImage from "../assets/images/background3.jpg";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      alert("Login Successful!");

      // navigate("/dashboard"); // Optional

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <div
        className="min-h-screen flex justify-center items-center bg-cover"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
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
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 rounded bg-white"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 rounded bg-white"
            />

            <button
              onClick={handleLogin}
              className="bg-gradient-to-br from-cyan-300 to-sky-800 w-full py-2 rounded"
            >
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
  );
}

export default LoginPage;
