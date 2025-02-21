import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) {
      console.warn("⚠️ No user ID found in session.");
      return;
    }

    const fetchEmployee = async () => {
      try {
        console.log(`🔍 Fetching employee data for ID: ${session.user.id}`);
        const res = await fetch(`/api/employees/${encodeURIComponent(session.user.id)}`);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`API Error: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        setEmployee(data);
      } catch (error) {
        console.error("🚨 Error fetching employee data:", error);
      }
    };

    fetchEmployee();
  }, [session]);

  console.log("🔍 Navbar Session User:", session?.user);
  console.log("🔍 Navbar Employee Data:", employee);

  return (
    <nav className="flex justify-between items-center p-4 bg-[#c95c5c] text-white shadow-md">
      <Link href="/" className="py-6 flex gap-2 cursor-pointer">
        <Image src="/logo.png" height={100} width={100} alt="logo" />
        <p className="text-[12px] font-bold">Employees' Catalog</p>
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/EmployeePage" className="hover:underline">Employees Page</Link>

        {employee ? (
          <div className="flex items-center gap-3">
            <Image
              src={employee.image || "/default-avatar.png"}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <button onClick={() => signOut()} className="bg-red-500 px-3 py-1 rounded">
              Logout
            </button>
          </div>
        ) : (
          <Link href="/login" className="bg-black px-4 py-2 rounded hover:bg-blue-600">Login</Link>
        )}
      </div>
    </nav>
  );
}
