"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Preloader from "./Preloader";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/not-authorized"); // create this page
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="p-6">
        <Preloader />
      </div>
    );
  }

  return <>{children}</>;
}
