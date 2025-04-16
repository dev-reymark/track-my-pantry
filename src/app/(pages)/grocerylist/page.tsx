"use client";

import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Loader from "@/components/loader";

interface Ingredient {
  id: string | null;
  name: string;
}

export default function GroceryList() {
  const [groceryItems, setGroceryItems] = useState<string[]>([]);
  const auth = getAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroceryItems = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const recipesSnapshot = await getDocs(collection(db, "recipes"));
          const missingIngredients: string[] = [];

          recipesSnapshot.forEach((doc) => {
            const recipe = doc.data();
            if (recipe?.ingredients) {
              recipe.ingredients.forEach((ingredient: Ingredient) => {
                if (!ingredient.id) {
                  missingIngredients.push(ingredient.name);
                }
              });
            }
          });

          // Set the missing ingredients as grocery items
          setGroceryItems(missingIngredients);
        } catch (error) {
          console.error("Error fetching grocery items:", error);
        } finally {
          setLoading(false); // Set loading to false once the data is fetched
        }
      }
    };

    fetchGroceryItems();
  }, [auth]);

  if (loading) {
    return (
      <ProtectedRoute>
        <ApplicationLayout>
          <Loader />
        </ApplicationLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <ApplicationLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold">Grocery List</h1>
          <p>Missing items to buy.</p>

          <Table className="mt-4" aria-label="Grocery List">
            <TableHeader>
              <TableColumn>ITEMS</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"No items needed. You're fully stocked!"}>
              {groceryItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
