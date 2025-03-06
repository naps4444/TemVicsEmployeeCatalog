"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import EmployeeEditForm from "./EmployeeEditForm";
import useEmployeeStore from "../store/employeeStore";

const EmployeeCard = ({ employee }) => {
  const { data: session } = useSession();
  const loggedInUser = session?.user;
  const { employees, updateEmployee, deleteEmployee } = useEmployeeStore();

  // ✅ Ensure employee data is up-to-date from Zustand store
  const updatedEmployee = employees.find((emp) => emp._id === employee._id) || employee;
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Ensure logged-in user ID exists
  if (!loggedInUser?.id) {
    console.error("🚨 Error: User ID is missing in session data.");
    if (typeof window !== "undefined") {
      alert("User ID is missing. Please log in again.");
    }
    return null;
  }

  // ✅ Ensure employee data is present
  if (!updatedEmployee) {
    return <p className="text-red-500 text-center font-semibold">Error: Employee data is missing</p>;
  }

  // ✅ Check if user is authorized to edit
  const canEdit = loggedInUser.id === updatedEmployee._id || loggedInUser.role === "admin";

  const handleUpdate = async (updatedInfo) => {
    if (!canEdit) {
      if (typeof window !== "undefined") {
        alert("❌ You are not authorized to edit this profile.");
      }
      return;
    }

    try {
      const response = await fetch(`/api/employees/${updatedEmployee._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedInfo),
      });

      const responseData = await response.json();
      if (response.ok) {
        updateEmployee(responseData);
        if (typeof window !== "undefined") {
          alert("Profile updated successfully.");
        }
        setIsEditing(false);
      } else {
        if (typeof window !== "undefined") {
          alert(`Failed to update profile: ${responseData.error}`);
        }
      }
    } catch (error) {
      console.error("🚨 Error updating user:", error);
      if (typeof window !== "undefined") {
        alert("An error occurred. Please try again.");
      }
    }
  };

  const handleDelete = async () => {
    if (typeof window !== "undefined" && !window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/${updatedEmployee._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (response.ok) {
        deleteEmployee(updatedEmployee._id);
        if (typeof window !== "undefined") {
          alert("Employee deleted successfully.");
          window.location.reload();
        }
      } else {
        if (typeof window !== "undefined") {
          alert(data.error || "Failed to delete employee.");
        }
      }
    } catch (error) {
      console.error("🚨 Error deleting user:", error);
      if (typeof window !== "undefined") {
        alert("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center w-full max-w-md mx-auto">
      {updatedEmployee.image ? (
        <Image
          src={updatedEmployee.image}
          alt="Profile"
          width={100}
          height={100}
          className="w-28 h-28 rounded-full border-2 border-gray-300 mb-4"
        />
      ) : (
        <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mb-4 text-lg">
          No Image
        </div>
      )}

      <h3 className="text-2xl font-semibold">{updatedEmployee.name ?? "No Name"}</h3>
      <p className="text-gray-600">{updatedEmployee.email ?? "No Email"}</p>

      {isEditing ? (
        <EmployeeEditForm
          user={updatedEmployee}
          onUpdate={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="mt-6 text-gray-700 space-y-2 text-sm">
          {["age", "education", "state", "religion", "department"].map((key) => (
            <p key={key}>
              <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
              {updatedEmployee[key] || "Not Provided"}
            </p>
          ))}
          <span
            className={`inline-block px-3 py-1 mt-2 rounded-full text-sm font-medium ${
              updatedEmployee.role === "admin"
                ? "bg-red-100 text-red-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {updatedEmployee.role || "No Role"}
          </span>

          {/* ✅ Conditional buttons based on permissions */}
          <div className="mt-5 flex gap-4">
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Edit Profile
              </button>
            )}

            {loggedInUser?.role === "admin" && (
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-5 py-2 rounded-md hover:bg-red-600 transition"
              >
                Delete User
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeCard;
