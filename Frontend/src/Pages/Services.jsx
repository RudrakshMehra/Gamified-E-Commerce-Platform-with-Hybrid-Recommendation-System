import { HeartPulse, Brain, BellRing, LineChart, ShieldCheck, Users } from "lucide-react";

export default function Services() {
  const services = [
    {
      icon: <HeartPulse className="w-10 h-10" />,
      title: "Real-Time Health Monitoring",
      desc: "Continuous tracking of vital signs like heart rate, SpO₂, temperature, and BP using connected devices.",
    },
    {
      icon: <Brain className="w-10 h-10" />,
      title: "Deep Learning Analysis",
      desc: "AI models analyze patient data to detect patterns, predict risks, and support early diagnosis.",
    },
    {
      icon: <BellRing className="w-10 h-10" />,
      title: "Smart Alerts",
      desc: "Automatic alerts to doctors and caregivers when abnormal health conditions are detected.",
    },
    {
      icon: <LineChart className="w-10 h-10" />,
      title: "Health Reports & Trends",
      desc: "Visual dashboards showing historical trends, predictions, and patient progress over time.",
    },
    {
      icon: <ShieldCheck className="w-10 h-10" />,
      title: "Secure Data Handling",
      desc: "Encrypted storage and role-based access to protect sensitive medical information.",
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "Remote Patient Care",
      desc: "Doctors can monitor patients remotely, reducing hospital visits and improving response time.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-16">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
        <p className="text-zinc-400">
          AI-powered healthcare services designed for continuous monitoring, early detection,
          and smarter medical decisions.
        </p>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((s, i) => (
          <div
            key={i}
            className="bg-zinc-900 rounded-2xl p-6 hover:bg-zinc-800 transition shadow-lg"
          >
            <div className="mb-4 text-indigo-400">{s.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
            <p className="text-zinc-400 text-sm">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-16">
        <h2 className="text-2xl font-semibold mb-3">Ready to experience smart healthcare?</h2>
        <p className="text-zinc-400 mb-6">
          Start monitoring patients with deep learning-driven insights today.
        </p>
        <button className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition">
          Get Started
        </button>
      </div>
    </div>
  );
}
