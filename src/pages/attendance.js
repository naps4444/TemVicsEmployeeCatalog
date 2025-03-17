import { useEffect, useState } from "react";
import AttendanceRecords from "./recordPage";

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
    
    <div className="w-full mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">Employee Attendance</h1>
      <table className="w-full border-collapse border border-gray-300">
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
                    <div className="flex flex-col justify-center gap-2 w-[120px] md:w-[230px] mx-auto">
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
                        className="p-1  border"
                      />
                      <button
                        className="p-1 bg-green-500 text-white disabled:opacity-50"
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
                    <div className="flex flex-col justify-center gap-2 w-[120px] md:w-[230px] mx-auto">
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
                        className="p-1 border"
                      />
                      <button
                        className=" p-1 bg-red-500 text-white disabled:opacity-50"
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

    <div>
      <AttendanceRecords/>
    </div>
    </>
  );
}
