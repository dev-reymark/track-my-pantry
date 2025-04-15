"use client";

import AdminRoute from "@/components/AdminRoute";
import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Input, Select, SelectItem, Button } from "@heroui/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Define the Category interface
interface Category {
  id: string;
  name: string;
}

export default function AddItems() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]); // Use the Category type
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[]; // Type assertion to ensure correct type
      setCategories(data);
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId) return toast.error("Fill all fields");

    setLoading(true);
    try {
      await addDoc(collection(db, "items"), {
        name,
        quantity,
        categoryId,
        createdAt: new Date(),
      });
      toast.success("Item added!");
      router.push("/pantry");
      setName("");
      setQuantity(1);
      setCategoryId("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminRoute>
        <ApplicationLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold">Pantry</h1>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              <Input
                label="Item Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                isRequired
              />
              <Input
                label="Quantity"
                type="number"
                value={`${quantity}`}
                onChange={(e) => setQuantity(Number(e.target.value))}
                isRequired
              />
              <Select
                label="Category"
                selectedKeys={[categoryId]}
                onSelectionChange={(keys) =>
                  setCategoryId(Array.from(keys)[0] as string)
                }
                isRequired
              >
                {categories.map((category) => (
                  <SelectItem key={category.id}>{category.name}</SelectItem>
                ))}
              </Select>
              <Button type="submit" color="primary" isLoading={loading}>
                {loading ? "Adding..." : "Add Item"}
              </Button>
            </form>
          </div>
        </ApplicationLayout>
      </AdminRoute>
    </ProtectedRoute>
  );
}
