"use client";

import { useAuth } from "@/lib/Context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MainContent from "./MainContent/page";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/Login");
    }
  }, [loading, user]);

  if (loading) return <p>Loading user...</p>;
  if (!user) return null;

  return (
    <>
      <MainContent />
    </>
  );
}
