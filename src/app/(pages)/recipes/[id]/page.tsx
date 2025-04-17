"use client";

import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button, Link } from "@heroui/react";
import Loader from "@/components/loader";
import { useAuth } from "@/context/AuthContext";

interface Ingredient {
  id: string | null;
  name: string;
}

interface Recipe {
  name: string;
  prepTime: number;
  calories: number;
  ingredients: Ingredient[];
  ingredientType: string;
  tags?: string[];
  description: string;
}

export default function ViewRecipe() {
  const { id } = useParams();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipeAndPantry = async () => {
      if (!id || !user?.uid) return;

      try {
        const docRef = doc(db, "recipes", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRecipe(docSnap.data() as Recipe);
        }

        const pantryRef = doc(db, "userPantry", user.uid);
        const pantrySnap = await getDoc(pantryRef);
        if (pantrySnap.exists()) {
          setPantryItems(pantrySnap.data()?.items || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeAndPantry();
  }, [id, user]);

  const getMissingIngredients = (recipe: Recipe) => {
    return recipe.ingredients.filter(
      (ingredient) => !pantryItems.includes(ingredient.id || "")
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <ApplicationLayout>
          <Loader />
        </ApplicationLayout>
      </ProtectedRoute>
    );
  }

  if (!recipe) {
    return (
      <ProtectedRoute>
        <ApplicationLayout>
          <div className="p-6">
            <h1 className="text-xl font-semibold">Recipe not found</h1>
          </div>
        </ApplicationLayout>
      </ProtectedRoute>
    );
  }

  const missingIngredients = getMissingIngredients(recipe);

  return (
    <ProtectedRoute>
      <ApplicationLayout>
        <div className="p-6 space-y-4 max-w-2xl">
          <Button as={Link} variant="flat" href="/recipes" color="primary">
            Back to recipes
          </Button>
          <h1 className="text-3xl font-bold">{recipe.name}</h1>

          <div>
            <strong>Prep Time:</strong> {recipe.prepTime} mins
          </div>
          <div>
            <strong>Calories:</strong> {recipe.calories}
          </div>
          <div>
            <strong>Ingredients:</strong>{" "}
            {recipe.ingredients.map((ing) => ing.name).join(", ")}
          </div>
          <div>
            <strong>Missing:</strong>{" "}
            {missingIngredients.length > 0 ? (
              <span className="text-red-600 font-medium">
                {missingIngredients.map((ing) => ing.name).join(", ")}
              </span>
            ) : (
              "--"
            )}
          </div>

          <div>
            <strong>Type:</strong> {recipe.ingredientType}
          </div>
          <div>
            <strong>Tags:</strong> {recipe.tags?.join(", ") || "None"}
          </div>
          <div className="whitespace-pre-wrap">
            <strong>Description:</strong> {recipe.description}
          </div>
        </div>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
