"use client";

import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button, Image, Input } from "@heroui/react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useRouter } from "next/navigation";

export default function AccountSetting() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
//   const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);
//   const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setEmail(data.email || user.email || "");
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!user) return;

    try {
      setLoading(true);
      const credential = EmailAuthProvider.credential(user.email!, password); // Use current password for re-authentication
      await reauthenticateWithCredential(user, credential); // Re-authenticate user
      await updatePassword(user, newPassword); // Update password
      toast.success("Password updated successfully! Please log in again.");
      router.push("/auth/login");
    } catch (error) {
      toast.error("Error updating password.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <ApplicationLayout>
        <div className="max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
          <form onSubmit={handleUpdate}>
            <div className="bg-white rounded-xl shadow-xs dark:bg-neutral-900">
              <div className="relative h-40 rounded-t-xl bg-[url('https://preline.co/assets/svg/examples/abstract-bg-1.svg')] bg-no-repeat bg-cover bg-center"></div>

              <div className="pt-0 p-4 sm:pt-0 sm:p-7">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="sr-only">Profile photo</label>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-x-5">
                      <Image
                        className="-mt-8 relative z-10 inline-block size-24 mx-auto sm:mx-0 rounded-full ring-4 ring-white dark:ring-neutral-900"
                        src="https://preline.co/assets/img/160x160/img1.jpg"
                        alt="Avatar"
                      />
                    </div>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-neutral-200">
                      Account Settings
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-neutral-400">
                      Manage your name, password and account settings.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="flex gap-2">
                      <Input
                        variant="faded"
                        isReadOnly
                        label="Name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <Input
                        variant="faded"
                        isReadOnly
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <Input
                      isRequired
                      label="Current Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      endContent={
                        <button type="button" onClick={toggleVisibility}>
                          {isVisible ? (
                            <Icon
                              className="pointer-events-none text-2xl text-default-400"
                              icon="solar:eye-closed-linear"
                            />
                          ) : (
                            <Icon
                              className="pointer-events-none text-2xl text-default-400"
                              icon="solar:eye-bold"
                            />
                          )}
                        </button>
                      }
                      type={isVisible ? "text" : "password"}
                    />
                    <Input
                      isRequired
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Input
                      isRequired
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button type="submit" color="primary" isLoading={loading}>
                      {loading ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
