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
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();

      console.log("🛠️ Debugging: Employees fetched from API:", data); // 🔍 Check the data structure

      if (Array.isArray(data.employees)) {
        console.log(
          "🔍 Checking _id in fetched employees:",
          data.employees.map((emp) => emp._id)
        ); // Log all _id values
        set({ employees: data.employees, loading: false });
      } else if (Array.isArray(data)) {
        console.log(
          "🔍 Checking _id in fetched employees:",
          data.map((emp) => emp._id)
        ); // Log all _id values if API returns an array directly
        set({ employees: data, loading: false });
      } else {
        throw new Error("Unexpected data format");
      }
    } catch (error) {
      console.error("🚨 Error fetching employees:", error);
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
