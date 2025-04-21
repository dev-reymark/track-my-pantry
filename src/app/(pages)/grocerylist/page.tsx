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
import {
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import Loader from "@/components/loader";

interface Ingredient {
  id: string;
  name: string;
}

export default function GroceryList() {
  const [missingIngredients, setMissingIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user?.uid) return;

    // Fetching pantry and meal plan data
    const pantryRef = doc(db, "userPantry", user.uid); // Single document for userPantry
    const mealPlansQuery = query(
      collection(db, "mealPlans"),
      where("userId", "==", user.uid)
    );

    const unsubscribePantry = onSnapshot(pantryRef, async (pantrySnap) => {
      const pantryData = pantrySnap.data();
      const pantryItemIds: string[] =
        pantryData?.items?.map((item: string) => item.trim().toLowerCase()) ||
        [];

      console.log("Pantry Item IDs:", pantryItemIds); // Log pantry item IDs

      // Fetch item names from the "items" collection
      const itemSnap = await getDocs(collection(db, "items"));
      const allItems = itemSnap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));

      // Create a map of item IDs to names
      const itemNameMap = allItems.reduce((acc, item) => {
        acc[item.id] = item.name.trim().toLowerCase();
        return acc;
      }, {} as Record<string, string>);

      console.log("Item Name Map:", itemNameMap); // Log the item name map

      const unsubscribeMeals = onSnapshot(mealPlansQuery, async (mealSnap) => {
        const mealPlans = mealSnap.docs.map((doc) => doc.data());
        const recipeIds = [...new Set(mealPlans.map((meal) => meal.recipeId))];

        console.log("Recipe IDs:", recipeIds); // Log recipe IDs

        if (recipeIds.length === 0) {
          setMissingIngredients([]);
          setLoading(false);
          return;
        }

        const allIngredients: string[] = [];

        await Promise.all(
          recipeIds.map(async (recipeId) => {
            const recipeRef = doc(db, "recipes", recipeId);
            const recipeSnap = await getDoc(recipeRef);
            const recipeData = recipeSnap.data();
            const ingredients: Ingredient[] = recipeData?.ingredients || [];

            console.log("Ingredients for Recipe ID:", recipeId, ingredients); // Log ingredients

            ingredients.forEach((ingredient) => {
              const ingredientName = ingredient.name?.trim().toLowerCase();
              const ingredientId = ingredient.id?.trim().toLowerCase();

              // Check if ingredient exists in pantry
              const existsInPantry = pantryItemIds.some(
                (itemId) => itemId === ingredientId
              );

              console.log(
                `Checking if "${ingredientName}" exists in pantry: ${existsInPantry}`
              ); // Log individual ingredient check

              if (!existsInPantry && ingredientName) {
                allIngredients.push(ingredientName);
              }
            });
          })
        );

        setMissingIngredients([...new Set(allIngredients)]);
        setLoading(false);
      });

      return () => unsubscribeMeals();
    });

    return () => unsubscribePantry();
  }, [user]);

  return (
    <ProtectedRoute>
      <ApplicationLayout>
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-2xl font-bold">Grocery List</h1>
          <p className="mb-4">
            These are the missing ingredients based on your meal plan and
            pantry.
          </p>

          <Table className="mt-4" aria-label="Grocery List">
            <TableHeader>
              <TableColumn>ITEMS</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={loading}
              loadingContent={<Loader />}
              emptyContent={"No items needed. You're fully stocked!"}
            >
              {missingIngredients.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="capitalize">{item}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
