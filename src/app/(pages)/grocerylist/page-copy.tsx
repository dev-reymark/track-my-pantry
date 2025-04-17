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
  quantity: number;
  unit: string;
}

interface PantryItem {
  name: string;
  quantity: number;
  unit: string;
}

export default function GroceryList() {
  const [groceryItems, setGroceryItems] = useState<string[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const auth = getAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Fetch pantry items
          const pantrySnapshot = await getDocs(
            collection(db, `users/${user.uid}/pantryItems`)
          );
          const pantryList: PantryItem[] = [];
          pantrySnapshot.forEach((doc) => {
            const data = doc.data();
            pantryList.push({
              name: data.name,
              quantity: data.quantity,
              unit: data.unit,
            });
          });
          setPantryItems(pantryList);

          // Fetch recipes and ingredients
          const recipesSnapshot = await getDocs(collection(db, "recipes"));
          const missingIngredients: string[] = [];

          recipesSnapshot.forEach((doc) => {
            const recipe = doc.data();
            if (recipe?.ingredients) {
              recipe.ingredients.forEach((ingredient: Ingredient) => {
                // Check if pantry contains this ingredient
                const pantryItem = pantryItems.find(
                  (item) =>
                    item.name.toLowerCase() === ingredient.name.toLowerCase()
                );

                // If the ingredient is missing or not enough in pantry, add to grocery list
                if (!pantryItem || pantryItem.quantity < ingredient.quantity) {
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

    fetchData();
  }, [auth, pantryItems]);

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
