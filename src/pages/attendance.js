import { useEffect, useState } from "react";
import AttendanceRecords from "./recordPage";
import Link from "next/link";

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({});

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/attendance/status");

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Fetch Error Response:", errorText);
        throw new Error("Failed to fetch employee data");
      }

      const data = await res.json();
      console.log("Fetched Employee Attendance Status:", data);

      if (!Array.isArray(data)) {
        console.error("Invalid employee data:", data);
        return;
      }

      setEmployees(data);

      // Update attendance state
      const attendanceMap = {};
      data.forEach((employee) => {
        attendanceMap[employee.id] = {
          signInTime: employee.signInTime || null,
          signOutTime: employee.signOutTime || null,
        };
      });

      setAttendance(attendanceMap);
      setLoading(false);
    } catch (error) {
      console.error("Fetch Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSignIn = async (employeeId) => {
    const employeePassword = passwords[employeeId];

    if (!employeePassword) {
      alert("Please enter a password");
      return;
    }

    const todayDate = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD

    try {
      const res = await fetch("/api/attendance/signIn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, password: employeePassword, date: todayDate }), // ✅ Add `date`
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Sign-In API Error:", errorText);
        alert(errorText);
        return;
      }

      const data = await res.json();
      console.log(`✅ Sign-In Successful for Employee ${employeeId}:`, data);

      // Update state
      setAttendance((prev) => ({
        ...prev,
        [employeeId]: { signInTime: data.attendance.signInTime, signOutTime: null },
      }));

      setPasswords((prev) => ({ ...prev, [employeeId]: "" }));

      setTimeout(fetchEmployees, 1000); // Delay refetch to allow backend updates
    } catch (error) {
      console.error("Error signing in:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleSignOut = async (employeeId) => {
    const employeePassword = passwords[employeeId];

    if (!employeePassword) {
      alert("Please enter a password");
      return;
    }

    try {
      const res = await fetch("/api/attendance/signOut", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, password: employeePassword }), // ✅ Now sending password
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Sign-Out API Error:", errorData);
        alert(errorData.error);
        return;
      }

      const data = await res.json();
      console.log(`✅ Sign-Out Successful for Employee ${employeeId}:`, data);

      // Update state
      setAttendance((prev) => ({
        ...prev,
        [employeeId]: {
          signInTime: prev[employeeId]?.signInTime,
          signOutTime: data.attendance.signOutTime,
        },
      }));

      setPasswords((prev) => ({ ...prev, [employeeId]: "" })); // Clear password input

      setTimeout(fetchEmployees, 1000); // Delay refetch to allow backend updates
    } catch (error) {
      console.error("Error signing out:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
    
    <div className="w-full mx-auto  p-4">
  <h1 className="text-2xl font-bold mb-4 text-center">Employee Attendance</h1>

  {/* Table for larger screens, card layout for smaller screens */}
  <div className="hidden md:block overflow-x-auto">
    <table className="w-full border-collapse border border-gray-300 min-w-[600px]">
      <thead>
        <tr className="bg-gray-200">
          <th className="border border-gray-300 p-2">Name</th>
          <th className="border border-gray-300 p-2">Status</th>
          <th className="border border-gray-300 p-2">Sign-In</th>
          <th className="border border-gray-300 p-2">Sign-Out</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((employee) => {
          const record = attendance[employee.id] || {};
          const isSignedIn = Boolean(record.signInTime);
          const isSignedOut = Boolean(record.signOutTime);

          return (
            <tr key={employee.id} className="text-center">
              <td className="border border-gray-300 p-2">{employee.name}</td>
              <td className={`border border-gray-300 p-2 ${isSignedIn ? "text-green-600" : "text-red-600"}`}>
                {isSignedIn ? "Signed In" : "Not Signed In"}
              </td>
              <td className="border border-gray-300 p-2">
                {isSignedIn ? (
                  <span className="text-green-500">✔ Signed In</span>
                ) : (
                  <div className="flex flex-col justify-center gap-2 mx-auto w-full max-w-[200px]">
                    <input
                      type="password"
                      value={passwords[employee.id] || ""}
                      onChange={(e) =>
                        setPasswords((prev) => ({
                          ...prev,
                          [employee.id]: e.target.value,
                        }))
                      }
                      placeholder="Enter password"
                      className="p-2 border w-full"
                    />
                   <button
  className="bg-black w-full text-white p-2 rounded-lg mt-2 transition-all duration-300 hover:bg-gray-800 hover:scale-105"
  onClick={() => handleSignIn(employee.id)}
  disabled={isSignedIn}
>
  Sign In
</button>
                  </div>
                )}
              </td>
              <td className="border border-gray-300 p-2">
                {isSignedOut ? (
                  <span className="text-red-500">✔ Signed Out</span>
                ) : (
                  <div className="flex flex-col justify-center gap-2 mx-auto w-full max-w-[200px]">
                    <input
                      type="password"
                      value={passwords[employee.id] || ""}
                      onChange={(e) =>
                        setPasswords((prev) => ({
                          ...prev,
                          [employee.id]: e.target.value,
                        }))
                      }
                      placeholder="Enter password"
                      className="p-2 border w-full"
                    />
                    <button
  className="bg-yellow-900 w-full text-white p-2 rounded-lg mt-2 transition-all duration-300 hover:bg-yellow-700 hover:scale-105"
  onClick={() => handleSignOut(employee.id)}
  disabled={!isSignedIn || isSignedOut}
>
  Sign Out
</button>
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>

  {/* Card Layout for Mobile Screens */}
  <div className="md:hidden flex flex-col gap-4">
    {employees.map((employee) => {
      const record = attendance[employee.id] || {};
      const isSignedIn = Boolean(record.signInTime);
      const isSignedOut = Boolean(record.signOutTime);

      return (
        <div key={employee.id} className="border border-gray-300 p-4 rounded-lg shadow-sm bg-white">
          <h2 className="text-lg font-semibold">{employee.name}</h2>
          <p className={`mt-1 ${isSignedIn ? "text-green-600" : "text-red-600"}`}>
            {isSignedIn ? "Signed In" : "Not Signed In"}
          </p>

          <div className="mt-2">
            {isSignedIn ? (
              <p className="text-green-500">✔ Signed In</p>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  type="password"
                  value={passwords[employee.id] || ""}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      [employee.id]: e.target.value,
                    }))
                  }
                  placeholder="Enter password"
                  className="p-2 border rounded w-full"
                />
                <button
  className="bg-black w-full text-white p-2 rounded-lg mt-2 transition-all duration-300 hover:bg-gray-800 hover:scale-105"
  onClick={() => handleSignIn(employee.id)}
  disabled={isSignedIn}
>
  Sign In
</button>

              </div>
            )}
          </div>

          <div className="mt-2">
            {isSignedOut ? (
              <p className="text-red-500">✔ Signed Out</p>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  type="password"
                  value={passwords[employee.id] || ""}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      [employee.id]: e.target.value,
                    }))
                  }
                  placeholder="Enter password"
                  className="p-2 border rounded w-full"
                />
                <button
  className="bg-yellow-900 w-full text-white p-2 rounded-lg mt-2 transition-all duration-300 hover:bg-yellow-700 hover:scale-105"
  onClick={() => handleSignOut(employee.id)}
  disabled={!isSignedIn || isSignedOut}
>
  Sign Out
</button>
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
</div>



    <div className="mx-auto">
      <AttendanceRecords/>
    </div>

    <div className="flex justify-center mt-10">
  <Link 
    href="/AllRecordsPage" 
    className="bg-[#EBE5C2] py-2 px-5 rounded-md transition duration-300 ease-in-out hover:bg-[#D6C89B] hover:shadow-md"
  >
    All Records
  </Link>
</div>

    </>
  );
}
