import { create } from "zustand";

const useEmployeeStore = create((set) => ({
  user: null, // Track the user in the state
  employees: [], // List of employees
  loading: false,
  error: null,

  // Set user information (Updates profile image in Navbar)
  setUser: (user) =>
    set((state) => ({
      user: { ...state.user, ...user },
    })),

  // Fetch Employees from API
  fetchEmployees: async () => {
    set({ loading: true, error: null });
  
    try {
      console.log("🚀 Fetching employees from API...");
  
      const response = await fetch("/api/employees", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",  // 🌍 CORS: Allow all origins
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
  
      console.log("🛠️ Response status:", response.status);
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("🚨 API Error Response:", errorData);
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("✅ Employees fetched successfully:", data);
  
      if (Array.isArray(data.employees)) {
        set({ employees: data.employees, loading: false });
      } else if (Array.isArray(data)) {
        set({ employees: data, loading: false });
      } else {
        throw new Error("Unexpected data format");
      }
    } catch (error) {
      console.error("🚨 Fetch Error:", error.message);
      set({ error: error.message, loading: false });
    }
  },
  

  // Add an Employee
  addEmployee: (newEmployee) =>
    set((state) => ({
      employees: [...state.employees, newEmployee],
    })),

  // Update an Employee
  updateEmployee: (updatedEmployee) =>
    set((state) => ({
      employees: state.employees.map((emp) =>
        emp._id === updatedEmployee._id
          ? { ...emp, ...updatedEmployee }
          : emp
      ),
    })),

  // Delete an Employee
  deleteEmployee: (employeeId) =>
    set((state) => ({
      employees: state.employees.filter((emp) => emp._id !== employeeId),
    })),
}));

export default useEmployeeStore;
