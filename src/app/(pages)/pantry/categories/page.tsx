"use client";

import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Input, Button } from "@heroui/react";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import AdminRoute from "@/components/AdminRoute";
import { useRouter } from "next/navigation";

export default function Categories() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name is required");

    setLoading(true);
    try {
      await addDoc(collection(db, "categories"), {
        name: name.trim(),
        createdAt: new Date(),
      });
      toast.success("Category added!");
      router.push("/pantry/list");
      setName("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminRoute>
        <ApplicationLayout>
          <div className="p-6 max-w-md space-y-4">
            <h1 className="text-2xl font-bold">Categories</h1>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <Input
                label="Category Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                isRequired
                placeholder="e.g. Fruits, Snacks, Drinks"
              />
              <Button type="submit" color="primary" isLoading={loading}>
                {loading ? "Adding..." : "Add Category"}
              </Button>
            </form>
          </div>
        </ApplicationLayout>
      </AdminRoute>
    </ProtectedRoute>
  );
}
