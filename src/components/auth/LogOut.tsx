"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import toast from "react-hot-toast";
import { LogOutIcon } from "lucide-react";
import { FirebaseError } from "firebase/app";

export default function LogOut() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("You have been logged out.");
      router.push("/auth/login");
    } catch (error) {
      const err = error as FirebaseError;
      console.error("Logout error:", err.message);
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <Button
      startContent={<LogOutIcon />}
      color="danger"
      variant="flat"
      onPress={handleLogout}
    >
      Log Out
    </Button>
  );
}
