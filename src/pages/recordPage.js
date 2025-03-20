import { useEffect, useState } from "react";

export default function RecordPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("day"); // Default filter: Today

  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/attendance/records?filterType=${filterType}`);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to fetch attendance records");
        }

        const data = await res.json();
        setRecords(data || []);
      } catch (error) {
        console.error("Fetch Error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceRecords();
  }, [filterType]); // Re-fetch when filterType changes

  return (
    <div className="mx-auto">
      

     
      <div className="px-8 pb-4">
      <h2 className="text-center font-bold text-lg">Attendance Records</h2>
      <label htmlFor="filter">Filter by: </label>
      <select
        id="filter"
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)} className="border-[1px] border-black px-2 rounded-md"
      >
        <option value="day">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="year">This Year</option>
      </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}

      {!loading && !error && (
        <table border="1" className="w-full">
          <thead>
            <tr>
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
      )}
    </div>
  );
}
