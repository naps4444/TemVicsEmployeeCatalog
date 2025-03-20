import { useEffect, useState } from "react";

export default function AllRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllRecords = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/attendance/all-records");
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
    fetchAllRecords();
  }, []);

  const groupByDate = (records) => {
    return records.reduce((acc, record) => {
      const date = new Date(record.signInTime).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(record);
      return acc;
    }, {});
  };

  const groupedRecords = groupByDate(records);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-center font-bold text-2xl mb-4">All Attendance Records</h2>
      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}
      {!loading && !error && records.length === 0 && (
        <p className="text-center">No records available.</p>
      )}
      {!loading && !error && records.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-4">
          {Object.keys(groupedRecords).map((date, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-xl font-semibold bg-gray-200 p-2 rounded-md">{date}</h3>
              <table className="w-full border-collapse border border-gray-300 mt-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2">Employee</th>
                    <th className="border border-gray-300 p-2">Sign-In Time</th>
                    <th className="border border-gray-300 p-2">Sign-Out Time</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedRecords[date].map((record, idx) => (
                    <tr key={idx} className="border border-gray-300">
                      <td className="border border-gray-300 p-2">{record.employeeId?.name || "Unknown"}</td>
                      <td className="border border-gray-300 p-2">{record.signInTime ? new Date(record.signInTime).toLocaleString() : "Not Signed In"}</td>
                      <td className="border border-gray-300 p-2">{record.signOutTime ? new Date(record.signOutTime).toLocaleString() : "Not Signed Out"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
