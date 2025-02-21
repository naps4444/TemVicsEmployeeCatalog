import { useEffect } from 'react'; // Only import useEffect from 'react'
import { SessionProvider } from "next-auth/react";
import Layout from "../components/Layout";
import "../styles/globals.css";

// Use Zustand store
import useEmployeeStore from "@/store/employeeStore";

export default function MyApp({ Component, pageProps }) {
  // Access Zustand store
  const { fetchEmployees } = useEmployeeStore();

  // Fetch employees when the app loads (optional)
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return (
    <SessionProvider session={pageProps.session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}
