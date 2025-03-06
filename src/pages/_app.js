import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import Layout from "../components/Layout";
import Loader from "../components/Loader"; // ✅ Import the Loader component
import "../styles/globals.css";

// Use Zustand store
import useEmployeeStore from "@/store/employeeStore";

export default function MyApp({ Component, pageProps }) {
  const { fetchEmployees } = useEmployeeStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Fetch employees when the app loads
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Handle page transitions
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <SessionProvider session={pageProps.session}>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <Loader /> {/* ✅ Use the Loader component */}
        </div>
      )}
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}
