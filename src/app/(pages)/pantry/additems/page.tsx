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
import { GoTrash } from "react-icons/go";

// Define the Category interface
interface Category {
  id: string;
  name: string;
}

export default function AddItems() {
  const router = useRouter();
  const [itemNames, setItemNames] = useState<string[]>([""]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      setCategories(data);
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || itemNames.some((item) => !item.trim()))
      return toast.error("Fill all item names and select a category");

    setLoading(true);
    try {
      const batch = itemNames.map((item) =>
        addDoc(collection(db, "items"), {
          name: item.trim(),
          categoryId,
          createdAt: new Date(),
        })
      );
      await Promise.all(batch);
      toast.success("Items added!");
      router.push("/pantry");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add items.");
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index: number, value: string) => {
    const updatedItems = [...itemNames];
    updatedItems[index] = value;
    setItemNames(updatedItems);
  };

  const removeItemField = (index: number) => {
    setItemNames(itemNames.filter((_, i) => i !== index));
  };

  const addItemField = () => {
    setItemNames([...itemNames, ""]);
  };

  return (
    <ProtectedRoute>
      <AdminRoute>
        <ApplicationLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Pantry</h1>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              {itemNames.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    label={`Item ${index + 1}`}
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    isRequired
                    className="flex-1"
                  />
                  {itemNames.length > 1 && (
                    <Button
                      type="button"
                      color="danger"
                      variant="light"
                      isIconOnly
                      onPress={() => removeItemField(index)}
                    >
                      <GoTrash size={20} />
                    </Button>
                  )}
                </div>
              ))}

              <Button type="button" variant="light" onPress={addItemField}>
                + Add Another Item
              </Button>

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

              <div className="flex gap-2">
                <Button type="submit" color="primary" isLoading={loading}>
                  {loading ? "Adding..." : "Add Items"}
                </Button>
                <Button
                  onPress={() => router.push("/pantry")}
                  color="warning"
                  variant="flat"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </ApplicationLayout>
      </AdminRoute>
    </ProtectedRoute>
  );
}
