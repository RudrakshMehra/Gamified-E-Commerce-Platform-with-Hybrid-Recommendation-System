import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      // 🔥 Create Auth User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCredential.user;

      // 🔥 Store data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: form.name,
        email: form.email,
        createdAt: new Date()
      });

      alert("Registration Successful!");
      navigate("/login");

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center bg-cover"
      style={{ backgroundImage: `url(${backgroundImage})` }}
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
            required
            className="w-full p-2 rounded bg-white"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full p-2 rounded bg-white"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full p-2 rounded bg-white"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            required
            className="w-full p-2 rounded bg-white"
          />

          <button
            type="submit"
            className="bg-gradient-to-br from-cyan-300 to-sky-800 w-full py-2 rounded"
          >
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
