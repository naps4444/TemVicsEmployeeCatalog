"use client"
import React, { useState, useEffect } from "react";
import EmployeeCard from "./EmployeeCard";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        console.log("📌 API Response Status:", response.status);

        const data = await response.json();
        console.log("📌 API Response Data:", data);

        if (response.ok && Array.isArray(data.employees)) {
          setEmployees(data.employees);
        } else {
          throw new Error(data.error || "Invalid response format");
        }
      } catch (error) {
        console.error("🚨 Fetch Employees Error:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        console.log("🔑 Logged-in User:", data);
        setLoggedInUser(data.user);
      } catch (error) {
        console.error("🚨 Error fetching session:", error.message);
      }
    };

    fetchEmployees();
    fetchSession();
  }, []);

  // Function to handle employee update
  const handleEmployeeUpdate = (updatedEmployee) => {
    setEmployees((prevEmployees) =>
      prevEmployees.map((employee) =>
        employee._id === updatedEmployee._id ? updatedEmployee : employee
      )
    );
  };

  // Function to remove an employee from the list after deletion
  const handleEmployeeDeleted = (id) => {
    setEmployees((prevEmployees) => prevEmployees.filter((employee) => employee._id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Employee List</h2>

      {loading && <p className="text-center text-gray-500 text-lg">Loading...</p>}
      {error && <p className="text-center text-red-500 text-lg">Error: {error}</p>}
      {!loading && !error && employees.length === 0 && (
        <p className="text-center text-gray-500 text-lg">No employees found.</p>
      )}

      {!loading && !error && employees.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee._id}
              employee={employee}
              onUpdate={handleEmployeeUpdate} 
              onDelete={handleEmployeeDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
