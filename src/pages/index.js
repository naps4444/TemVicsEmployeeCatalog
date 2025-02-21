import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import EmployeeCard from "./EmployeeCard";

export default function Home() {
  const { data: session, status } = useSession();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false); // Ensure loading stops when there's no session
      return;
    }

    const fetchEmployee = async () => {
      try {
        const res = await fetch(`/api/employees/${session.user.id}`);
        if (!res.ok) throw new Error("Failed to fetch employee data");
        const data = await res.json();
        setEmployee(data);
      } catch (error) {
        console.error("🚨 Error fetching employee data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [session]);

  console.log("🛠️ Debugging session data:", session);
  console.log("🛠️ Debugging employee data:", employee);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {loading ? (
        <p>Loading...</p>
      ) : session ? (
        <>
          <h1 className="text-3xl font-bold">Welcome, {session.user.name}!</h1>
          {employee ? <EmployeeCard employee={employee} /> : <p>Error loading employee details.</p>}
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold">Welcome to the Employee Catalog</h1>
          <p>Manage employees efficiently.</p>
          <div className="mt-4 flex gap-4">
            <Link href="/login" className="px-4 py-2 bg-black text-white rounded hover:bg-blue-600 transition">
              Login
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-black text-white rounded hover:bg-green-600 transition">
              Signup
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
