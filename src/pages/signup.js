import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee", // Default role
    department: "General", // Default department
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage("User registered successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000); // Redirect after 2 seconds
    } else {
      setMessage(data.message || "An error occurred.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-[#F8F3D9] min-h-screen p-4">

      <div className="py-6 flex gap-2">
        <Image src="/logo.png" height={100} width={100} alt="logo" />
        <p className="text-[12px] font-bold">Employees' Catalog</p>
      </div>


      <h1 className="text-[14px] font-bold mb-4">Sign Up</h1>

      <form className="w-full md:w-[500px] flex flex-col gap-4 bg-black text-black p-6 rounded shadow-md" onSubmit={handleSubmit}>

     
          

          <input
          type="text"
          placeholder="Full Name"
          className="border p-2 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />


       


        
        

<input
  type="email"
  placeholder="Email"
  className="border p-2 rounded"
  value={form.email}
  onChange={(e) => setForm({ ...form, email: e.target.value })}
  required
  autoComplete="off"
/>

<input
  type="password"
  placeholder="Password"
  className="border p-2 rounded"
  value={form.password}
  onChange={(e) => setForm({ ...form, password: e.target.value })}
  required
  autoComplete="new-password"
/>


        <select
          className="border p-2 rounded"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>

        <select
          className="border p-2 rounded"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        >
          <option value="General">General</option>
          <option value="Sales">Sales</option>
          <option value="Marketing">Marketing</option>
          <option value="HR">HR</option>
          <option value="Engineering">Engineering</option>
        </select>

        <button className="bg-black text-white px-4 py-2 rounded border-[2px] border-[#B9B28A] hover:bg-[#B9B28A]" type="submit" disabled={loading}>
          {loading ? "Registering..." : "Sign Up"}
        </button>
      </form>

      {message && <p className="mt-4 text-red-500">{message}</p>}

      <p className="mt-4 text-[16px] font-bold">
        Already have an account? <a href="/login" className="text-blue-500 underline">Login</a>
      </p>
    </div>
  );
}
