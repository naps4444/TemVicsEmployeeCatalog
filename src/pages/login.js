import { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const result = await signIn("credentials", {
      redirect: false, // Prevent full-page redirect
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setMessage(result.error);
    } else {
      router.push("/profile"); // Redirect on success
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#F8F3D9] text-black">

      <div className="py-6 flex gap-2">
              <Image src="/logo.png" height={100} width={100} alt="logo" />
              <p className="text-[12px] font-bold">Employees' Catalog</p>
            </div>



      <h1 className="text-[14px] font-bold mb-4">Login</h1>

      <form className="w-full md:w-[500px] flex flex-col gap-4 bg-black p-6 rounded shadow-md" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required autoComplete="off"
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required autoComplete="new-password"
        />
        <button className="bg-black text-white border-[2px] border-[#B9B28A] px-4 py-2 rounded hover:bg-[#B9B28A]" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>


        
      </form>

      <p className="mt-4 text-[16px] font-bold">
  Don't have an account?{" "}
  <Link href="/signup" className="text-blue-500 underline">
    Sign up
  </Link>
</p>

      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}
