import React from "react";
import { useNavigate } from "react-router-dom";
import { NavLink, Outlet } from "react-router-dom";
import Logo from "./assets/images/logo.png"   
import Contact from "./Pages/Contact.jsx"         


export default function Services() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 text-zinc-800">
      {/* navbar */}
        <nav className="bg-gradient-to-br from-cyan-400 to-sky-600  flex flex-col ">
        <div className="flex justify-between items-center px-6 md:px-32 py-5">
          <img src={Logo} alt="avatar" className="md:w-2xs w-36 object-cover" />
          {/* <h1 className="text-2xl md:text-5xl font-bold">SmartHealth</h1> */}
          <div className="flex md:gap-6 items-center text-sm md:text-xl">
            <span className="hover:text-blue-600 cursor-default font-bold " onClick={()=> navigate("/services")} >Services</span>
            <span className="hover:text-blue-600 cursor-default font-bold " onClick={()=> navigate("/services")}>About</span>
            <span className="hover:text-blue-600 cursor-default font-bold " onClick={()=> navigate("/services")}>Team</span>

            <button
              className="bg-indigo-600 px-4 py-2 rounded-3xl hidden md:block hover:bg-indigo-500"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>  
          </div>

      {/* Header */}
      <header className=" text-white md:py-24 py-7 md:pt-16 px-6 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Deep Learning–Enhanced Smart Healthcare Monitoring
        </h1>

        <p className="text-lg mb-6">
          AI-powered real-time health monitoring for early diagnosis and better patient care
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <button className="bg-white text-sky-700 px-6 py-3 rounded-full font-semibold hover:bg-cyan-300 transition" onClick={() => navigate("/register")}>
            Get Started
          </button>
          <button
              className="bg-indigo-600 px-6 py-3 rounded-full font-semibold hover:bg-cyan-300 transition md:hidden "
              onClick={() => navigate("/login")}
            >
              Login     
            </button>
        </div>
      </header>
        </nav>


      {/* Sections Wrapper */}
      <div className="max-w-6xl mx-auto px-6">

        {/* System Overview */}
        <Section title="System Overview" subtitle="Intelligent healthcare monitoring using deep learning and real-time data analysis">
          <Grid>
            <Card title="Real-Time Monitoring">
              Continuously tracks vital signs such as heart rate, temperature, blood pressure, and oxygen levels.
            </Card>

            <Card title="Deep Learning Analysis">
              Advanced AI models analyze health data to detect anomalies and predict potential risks.
            </Card>

            <Card title="Smart Alerts">
              Automatically sends alerts to doctors and caregivers during abnormal health conditions.
            </Card>
          </Grid>
        </Section>

        {/* Key Features */}
        <Section title="Key Features">
          <Grid>
            <Card title="Remote Patient Monitoring">
              Doctors can monitor patients anytime, anywhere through a secure dashboard.
            </Card>

            <Card title="Health Reports & Trends">
              Visualizes long-term health patterns for better diagnosis and treatment planning.
            </Card>

            <Card title="Secure Medical Data">
              Ensures patient data privacy with authentication and encrypted storage.
            </Card>
          </Grid>
        </Section>

        {/* How It Works */}
        <Section title="How It Works">
          <Grid>
            {["Data Collection", "Data Transmission", "AI Processing", "Alerts & Insights"].map(
              (item, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-xl shadow-lg text-center hover:-translate-y-1 transition"
                >
                  <span className="inline-flex items-center justify-center bg-sky-700 text-white w-11 h-11 rounded-full font-bold mb-3">
                    {i + 1}
                  </span>

                  <h3 className="text-sky-700 font-semibold mb-2">{item}</h3>

                  <p className="text-sm text-gray-600">
                    {[
                      "Wearable sensors collect patient vital data.",
                      "Health data is securely sent to the system.",
                      "Deep learning models analyze incoming data.",
                      "System generates alerts and health insights."
                    ][i]}
                  </p>
                </div>
              )
            )}
          </Grid>
        </Section>

        {/* Tech Stack */}
        <Section title="Technology Stack">
          <Grid>
            <Card title="Frontend">HTML, CSS, JavaScript</Card>
            <Card title="Backend">Python (Flask / Django)</Card>
            <Card title="Deep Learning">TensorFlow / PyTorch</Card>
            <Card title="Database">MySQL / MongoDB</Card>
          </Grid>
        </Section>

      </div>

      {/* Contact */}
        <Section title=" Let's Connect   ">
      <Contact/>

        </Section>

      {/* CTA */}
      <div className="bg-sky-700 text-white text-center py-16 px-6">
        <h2 className="text-3xl font-bold mb-3">
          Transform Healthcare with Intelligent Monitoring
        </h2>

        <p className="mb-6">
          Start monitoring patients smarter and faster using AI-driven healthcare solutions.
        </p>

        <button className="bg-white text-sky-700 px-8 py-3 rounded-full font-semibold hover:bg-cyan-100 transition">
          Start Monitoring
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white text-center py-4 text-sm">
        © 2026 Smart Healthcare Monitoring System | All Rights Reserved
      </footer>

    </div>
  );
}

/* Reusable Components */

function Section({ title, subtitle, children }) {
  return (
    <section className="py-16 ">
      <div className="text-center mb-10">
        <h2 className="text-3xl underline font-bold text-sky-700">{title}</h2>
        {subtitle && <p className="text-gray-500 mt-2">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {children}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition">
      <h3 className="text-sky-700 font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{children}</p>
    </div>
  );
}
