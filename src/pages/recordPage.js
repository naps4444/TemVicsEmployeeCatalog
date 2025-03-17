import { useEffect, useState } from "react";

export default function RecordPage() {
  const [records, setRecords] = useState([]); // Ensure initial state is an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      try {
        const res = await fetch("/api/attendance/records");

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to fetch attendance records");
        }

        const data = await res.json();
        setRecords(data || []); // Ensure data is always an array
      } catch (error) {
        console.error("Fetch Error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceRecords();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
        {/* 🔹 Attendance Records Section */}
      <h2>Attendance Records</h2>
      <table border="1" className="w-full">
        <thead>
          <tr className="">
            <th>Name</th>
            <th>Sign-In Time</th>
            <th>Sign-Out Time</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr key={index} className="text-center">
              <td>{record.name}</td>
              <td>{record.signInTime !== "Not Signed In" ? new Date(record.signInTime).toLocaleString() : "Not Signed In"}</td>
              <td>{record.signOutTime !== "Not Signed Out" ? new Date(record.signOutTime).toLocaleString() : "Not Signed Out"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
