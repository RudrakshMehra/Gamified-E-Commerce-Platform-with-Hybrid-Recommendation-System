import { useNavigate } from "react-router-dom";
import SideImage from "../assets/images/side.jpg";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-zinc-900 text-white min-h-screen">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-4 md:px-20 py-5 bg-zinc-800">
        <h1 className="text-2xl md:text-4xl font-bold">SmartHealth</h1>

        <div className="flex gap-3 md:gap-6 items-center text-sm md:text-xl">
          <span>Home</span>
          <span>About</span>
          <span>Team</span>

          <button
            className="bg-indigo-500 px-3 py-1 md:px-4 md:py-2 rounded"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col-reverse md:h-screen md:flex-row items-center justify-between px-6 md:px-20 py-16 gap-12">

        {/* Text */}
        <div className="text-center md:text-left">

          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Your Health in your Hands
          </h1>

          <p className="text-zinc-400 text-base md:text-xl mb-6">
            Get Started Here.
          </p>

          <div className="flex justify-center md:text-2xl md:justify-start gap-4">

            <button
              className="bg-indigo-500 px-6 py-2 rounded"
              onClick={() => navigate("/register")}
            >
              Register
            </button>

            <button
              className="border md:text-2xl px-6 py-2 rounded"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

          </div>
        </div>

        {/* Image */}
        <div className="w-full md:w-1/2 flex justify-center">

          <img
            src={SideImage}
            alt="health"
            className="max-w-xs lg:max-w-lg"
          />

        </div>

      </section>

    </div>
  );
}

export default LandingPage;
