"use client";

import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Button, Card, Checkbox, CheckboxGroup } from "@heroui/react";

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

export default function AddItems() {
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

        // Fetch items
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

  return (
    <ProtectedRoute>
      <ApplicationLayout>
        <div className="max-w-3xl mx-auto px-3">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-4">
              Select available items in your pantry
            </h1>

            {loading ? (
              <p>Loading...</p>
            ) : categories.length === 0 ? (
              <p>No categories found.</p>
            ) : (
              categories.map((category) => {
                const categoryItems = getItemsByCategory(category.id);
                return (
                  <div key={category.id} className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">
                      {category.name}
                    </h2>
                    {categoryItems.length > 0 ? (
                      <div className="flex gap-4">
                        {categoryItems.map((item) => (
                          <CheckboxGroup key={item.id}>
                            <Checkbox className="font-medium text-lg">
                              {item.name}
                            </Checkbox>
                          </CheckboxGroup>
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

            <Button color="primary">Submit</Button>
          </Card>
        </div>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
