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
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Loader from "@/components/loader";

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface PantryItem {
  name: string;
}

interface MealPlanItem {
  recipeId: string;
}

export default function GroceryList() {
  const [groceryItems, setGroceryItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchGroceryItems = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Fetch pantry items (only names are needed)
        const pantrySnapshot = await getDocs(
          collection(db, `users/${user.uid}/pantryItems`)
        );
        const pantryList: PantryItem[] = pantrySnapshot.docs.map((doc) => ({
          name: doc.data().name,
        }));

        // Fetch meal plan recipes for this user
        const mealPlanSnapshot = await getDocs(
          query(collection(db, "mealPlans"), where("userId", "==", user.uid))
        );
        const mealPlans = mealPlanSnapshot.docs.map((doc) =>
          doc.data()
        ) as MealPlanItem[];

        // Get all unique recipe IDs from the meal plan
        const recipeIds = [...new Set(mealPlans.map((mp) => mp.recipeId))];

        // Fetch all recipes that are in the meal plan
        const allIngredients: Ingredient[] = [];

        for (const recipeId of recipeIds) {
          const recipeDoc = await getDoc(doc(db, "recipes", recipeId));
          const recipeData = recipeDoc.data();
          if (recipeData && recipeData.ingredients) {
            recipeData.ingredients.forEach((ingredient: Ingredient) => {
              allIngredients.push(ingredient);
            });
          }
        }

        // Get missing ingredients (not in pantry)
        const missingIngredients: string[] = [];

        allIngredients.forEach((ingredient) => {
          const isInPantry = pantryList.some(
            (item) =>
              item.name.trim().toLowerCase() ===
              ingredient.name.trim().toLowerCase()
          );

          if (!isInPantry) {
            missingIngredients.push(ingredient.name);
          }
        });

        // Remove duplicates
        const uniqueMissingIngredients = [...new Set(missingIngredients)];
        setGroceryItems(uniqueMissingIngredients);
      } catch (err) {
        console.error("Error fetching grocery list:", err);
      } finally {
        setLoading(false);
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
          <p>These are the missing ingredients based on your meal plan.</p>

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
