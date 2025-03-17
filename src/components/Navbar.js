import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Menu, X } from "lucide-react"; // Icons for hamburger menu

export default function Navbar() {
  const { data: session, status } = useSession();
  const [employee, setEmployee] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null); // Reference for the menu container

  // Fetch employee data when session is loaded
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) return;

    const fetchEmployee = async () => {
      try {
        const res = await fetch(`/api/employees/${encodeURIComponent(session.user.id)}`);
        if (!res.ok) throw new Error("Failed to fetch employee data");
        const data = await res.json();
        setEmployee(data);
      } catch (error) {
        console.error("Error fetching employee data:", error.message);
      }
    };

    fetchEmployee();
  }, [session, status]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#F8F3D9] text-black shadow-md p-4 h-[80px] md:py-[20px] z-50">

      <div className="flex justify-between items-center relative">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" height={100} width={100} alt="logo" className="w-[200px]"/>
        </Link>

        {/* Mobile Menu Button */}
        <button className="md:hidden focus:outline-none" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
  <Link href="/EmployeePage" className="hover:underline">Employees Page</Link>
  <Link href="/ProductUpload" className="hover:underline">Upload Products</Link>
  <Link href="/Products" className="hover:underline">Products Items</Link> {/* ✅ Added here */}

          {status === "loading" ? (
            <p>Loading...</p>
          ) : employee ? (
            <div className="flex items-center gap-3">
              <Image src={employee?.image || "/default-avatar.png"} alt="Profile" width={40} height={40} className="rounded-full object-cover" />
              <button onClick={() => signOut()} className="bg-black px-3 py-1 text-white rounded hover:bg-[#B9B28A]">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-black text-white px-4 py-2 rounded hover:bg-[#B9B28A]">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        ref={menuRef}
        className={`md:hidden flex flex-col gap-3 bg-[#B9B28A] shadow-lg p-4 rounded-lg absolute top-full left-0 w-full z-50 transition-all duration-300 ease-in-out ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <Link href="/EmployeePage" className="hover:underline" onClick={() => setMenuOpen(false)}>Employees Page</Link>
        <Link href="/ProductUpload" className="hover:underline" onClick={() => setMenuOpen(false)}>Upload Products</Link>
        <Link href="/Products" className="hover:underline" onClick={() => setMenuOpen(false)}>Products Items</Link>
        
        {status === "loading" ? (
          <p>Loading...</p>
        ) : employee ? (
          <div className="flex justify-center items-center gap-3">
            <Image src={employee?.image || "/default-avatar.png"} alt="Profile" width={40} height={40} className="rounded-full object-cover" />
            <button
  onClick={() => signOut({ callbackUrl: "/login" })} // ✅ Redirects to login page after logout
  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
>
  Logout
</button>

          </div>
        ) : (
          <Link href="/login" className="bg-black px-4 py-2 rounded hover:bg-blue-600 text-center" onClick={() => setMenuOpen(false)}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
