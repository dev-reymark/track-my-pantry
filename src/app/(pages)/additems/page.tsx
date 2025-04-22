"use client";

import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { Button, Card, Checkbox, CheckboxGroup } from "@heroui/react";
import toast from "react-hot-toast";
import Loader from "@/components/loader";
import { useAuth } from "@/context/AuthContext";

type Category = {
  id: string;
  name: string;
};

type PantryItem = {
  id: string;
  name: string;
  categoryId: string;
};

export default function AddItems() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<PantryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [catSnap, itemSnap] = await Promise.all([
          getDocs(query(collection(db, "categories"), orderBy("name"))),
          getDocs(query(collection(db, "items"), orderBy("name"))),
        ]);

        const categoryData = catSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];

        const itemData = itemSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PantryItem[];

        setCategories(categoryData);
        setItems(itemData);

        // Fetch user's previously selected items
        // if (user) {
        //   const pantryDoc = await getDoc(doc(db, "userPantry", user.uid));
        //   if (pantryDoc.exists()) {
        //     setSelectedItems(pantryDoc.data()?.items || []);
        //   }
        // }
        const LOAD_PREVIOUS_SELECTIONS = false; // Toggle this

        if (user && LOAD_PREVIOUS_SELECTIONS) {
          const pantryDoc = await getDoc(doc(db, "userPantry", user.uid));
          if (pantryDoc.exists()) {
            setSelectedItems(pantryDoc.data()?.items || []);
          }
        }

      } catch (err) {
        console.error("Error loading data:", err);
        toast.error("Failed to load items.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getItemsByCategory = (categoryId: string) =>
    items.filter((item) => item.categoryId === categoryId);

  const handleSubmit = async () => {
    if (!user || selectedItems.length === 0) {
      toast.error("Please select items");
      return;
    }

    try {
      setIsSubmitting(true);

      const pantryRef = doc(db, "userPantry", user.uid);
      const pantrySnap = await getDoc(pantryRef);

      const existingItems: string[] = pantrySnap.exists()
        ? pantrySnap.data().items || []
        : [];

      const updatedItems = Array.from(
        new Set([...existingItems, ...selectedItems])
      ); // merge and dedupe

      await setDoc(pantryRef, {
        items: updatedItems,
        updatedAt: new Date(),
      });

      toast.success("Pantry updated!");
      setSelectedItems([]); // Optional: Clear UI after submit
    } catch (err) {
      console.error(err);
      toast.error("Failed to save pantry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <ApplicationLayout>
        <div className="max-w-3xl mx-auto p-6">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-4">
              Select available items in your pantry
            </h1>

            {loading ? (
              <Loader />
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
                      <CheckboxGroup
                        value={selectedItems}
                        onValueChange={(keys) =>
                          setSelectedItems(keys as string[])
                        }
                        orientation="horizontal"
                      >
                        {categoryItems.map((item) => (
                          <Checkbox
                            color="success"
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                          </Checkbox>
                        ))}
                      </CheckboxGroup>
                    ) : (
                      <p className="text-default-500">
                        No items in this category.
                      </p>
                    )}
                  </div>
                );
              })
            )}

            <Button
              isLoading={isSubmitting}
              onPress={handleSubmit}
              className="mt-4"
              color="primary"
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </Card>
        </div>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
