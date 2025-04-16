"use client";

import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button, Link } from "@heroui/react";
import Loader from "@/components/loader";

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
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;
      const docRef = doc(db, "recipes", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setRecipe(docSnap.data() as Recipe); // Type assertion
      }
      setLoading(false);
    };

    fetchRecipe();
  }, [id]);

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

  return (
    <ProtectedRoute>
      <ApplicationLayout>
        <div className="p-6 space-y-4 max-w-2xl">
          <Button as={Link} href="/recipes" color="primary">
            Back
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
            {recipe.ingredients.filter((ing) => !ing.id).length > 0 ? (
              <span className="text-red-600 font-medium">
                {recipe.ingredients
                  .filter((ing) => !ing.id)
                  .map((ing) => ing.name)
                  .join(", ")}
              </span>
            ) : (
              "--"
            )}
          </div>

          <div>
            <strong>Type:</strong> {recipe.ingredientType}
          </div>
          <div>
            <strong>Tags:</strong> {recipe.tags?.join(", ")}
          </div>
          <div className="whitespace-pre-wrap">
            <strong>Description:</strong> {recipe.description}
          </div>
        </div>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
