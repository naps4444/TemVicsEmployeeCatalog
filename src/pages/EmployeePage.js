import React, { useEffect, useState } from "react";
import EmployeeList from "./EmployeeList";

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    // Fetch employee data (replace with your API endpoint)
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((err) => console.error("Error fetching employees:", err));
  }, []);

  return (
    <div className="min-h-screen bg-[#504B38] py-10">
      <EmployeeList employees={employees} />
    </div>
  );
};

export default EmployeePage;
