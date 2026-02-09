import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

function Dashboard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">

      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-zinc-800 p-4 flex items-center z-50">
        <button onClick={() => setOpen(true)} className="text-2xl">
          ☰
        </button>
        <h2 className="ml-4 font-bold text-xl">Dashboard</h2>
      </div>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed md:static z-50
        w-64 bg-zinc-800 p-6 space-y-6 min-h-screen
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        `}
      >

        <h2 className="font-bold text-2xl hidden md:block">Dashboard</h2>

        <NavItem to="home" setOpen={setOpen}>Home</NavItem>
        <NavItem to="period" setOpen={setOpen}>Periodical Health Data</NavItem>
        <NavItem to="graphical" setOpen={setOpen}>Graphical</NavItem>
        <NavItem to="chd" setOpen={setOpen}>CHD Prediction</NavItem>

        <p className="hover:text-orange-700 cursor-pointer">
          Logout
        </p>

      </aside>

      {/* Main Area */}
      <main className="flex-1 p-4 md:p-10 mt-16 md:mt-0">
        <Outlet />
      </main>

    </div>
  );
}

export default Dashboard;

function NavItem({ to, children, setOpen }) {
  return (
    <NavLink
      to={to}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `block py-2 pl-3 ${
          isActive ? "text-orange-700" : "text-white"
        } hover:text-orange-700`
      }
    >
      {children}
    </NavLink>
  );
}
