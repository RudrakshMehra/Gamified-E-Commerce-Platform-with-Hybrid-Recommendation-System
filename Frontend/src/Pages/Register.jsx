import { useNavigate } from "react-router-dom";
import { useState } from "react";
import backgroundImage from "../assets/images/background3.jpg";


export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log(form);

    navigate("/login");
  };

  return (
    <div className="min-h-screen  flex justify-center items-center bg-cover"       style={{ backgroundImage: `url(${backgroundImage})` }}
    >

      <div className="bg-gray-300 w-[380px] rounded-lg">

        <div className="bg-gradient-to-br from-cyan-300 to-sky-800 p-6 text-center font-bold text-2xl">
          Register Form
        </div>

        <form className="p-6 space-y-4" onSubmit={handleSubmit}>

          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full p-2 rounded bg-white"
          />

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-2 rounded bg-white"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-2 rounded bg-white"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            className="w-full p-2 rounded bg-white"
          />

          <button className="bg-gradient-to-br from-cyan-300 to-sky-800 w-full py-2 rounded">
            Register
          </button>

          <p
            className="text-center text-sm text-indigo-800 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Already have an account? Login
          </p>

        </form>

      </div>
    </div>
  );
}
