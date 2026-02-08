import { useNavigate } from "react-router-dom";
import { useState } from "react";

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
    <div className="min-h-screen bg-zinc-900 flex justify-center items-center">

      <div className="bg-zinc-800 w-[380px] rounded-lg">

        <div className="bg-indigo-500 p-6 text-center font-bold text-xl">
          Register
        </div>

        <form className="p-6 space-y-4" onSubmit={handleSubmit}>

          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full p-2 rounded bg-zinc-700"
          />

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-2 rounded bg-zinc-700"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-2 rounded bg-zinc-700"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            className="w-full p-2 rounded bg-zinc-700"
          />

          <button className="bg-indigo-500 w-full py-2 rounded">
            Register
          </button>

          <p
            className="text-center text-sm text-indigo-400 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Already have account? Login
          </p>

        </form>

      </div>
    </div>
  );
}
