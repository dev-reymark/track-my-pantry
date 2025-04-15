"use client";

import { useEffect, useState } from "react";
import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardBody, Button, Link } from "@heroui/react";

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

  return (
    <ProtectedRoute>
      <AdminRoute>
        <ApplicationLayout>
          <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Pantry List</h1>

            <div className="flex gap-2">
              <Button as={Link} href="/pantry/additems" color="primary">
                Add Item
              </Button>
              <Button
                as={Link}
                href="/pantry/categories"
                color="primary"
                variant="flat"
              >
                Add Categories
              </Button>
            </div>
            {loading ? (
              <p>Loading...</p>
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
                          <div className="grid gap-4 md:grid-cols-7">
                            {categoryItems.map((item) => (
                              <Card key={item.id}>
                                {/* <CardHeader className="font-medium text-lg">
                                  {item.name}
                                </CardHeader> */}
                                <CardBody className="flex items-center">
                                  {/* <p>Quantity: {item.quantity}</p> */}
                                  {item.name}
                                </CardBody>
                              </Card>
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
