"use client";

import { useEffect, useState } from "react";
import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button, Link, Chip } from "@heroui/react";
import Loader from "@/components/loader";
import { GoTrash } from "react-icons/go";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Category = {
  id: string;
  name: string;
};

type PantryItem = {
  id: string;
  name: string;
  categoryId: string;
  quantity: number;
};

export default function PantryList() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const catSnap = await getDocs(
          query(collection(db, "categories"), orderBy("name"))
        );
        const categoryData = catSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];

        // Fetch pantry items
        const itemSnap = await getDocs(
          query(collection(db, "items"), orderBy("name"))
        );
        const itemData = itemSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PantryItem[];

        setCategories(categoryData);
        setItems(itemData);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getItemsByCategory = (categoryId: string) =>
    items.filter((item) => item.categoryId === categoryId);

  const handleDelete = async (id: string) => {
    try {
      // Delete the item from Firestore
      await deleteDoc(doc(db, "items", id));

      // Update the local state by removing the deleted item
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      toast.success("Item deleted!");
      router.push("/pantry");
    } catch (error) {
      console.error("Error deleting item: ", error);
    }
  };

  return (
    <ProtectedRoute>
      <AdminRoute>
        <ApplicationLayout>
          <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Pantry</h1>

            <div className="flex gap-2">
              <Button as={Link} href="/pantry/additems" color="primary">
                Add Item
              </Button>
              <Button
                as={Link}
                href="/pantry/categories"
                color="success"
                variant="flat"
              >
                Add Categories
              </Button>
            </div>
            {loading ? (
              <Loader />
            ) : (
              <>
                {categories.length === 0 ? (
                  <p>No categories found.</p>
                ) : (
                  categories.map((category) => {
                    const categoryItems = getItemsByCategory(category.id);
                    return (
                      <div key={category.id} className="space-y-2">
                        <h2 className="text-xl font-semibold">
                          {category.name}
                        </h2>
                        {categoryItems.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {categoryItems.map((item) => (
                              <Chip
                                variant="flat"
                                endContent={
                                  <GoTrash
                                    size={16}
                                    className="mr-1 text-danger"
                                  />
                                }
                                onClose={() => handleDelete(item.id)}
                                key={item.id}
                              >
                                {item.name}
                              </Chip>
                            ))}
                          </div>
                        ) : (
                          <p className="text-default-500">
                            No items in this category.
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </>
            )}
          </div>
        </ApplicationLayout>
      </AdminRoute>
    </ProtectedRoute>
  );
}
