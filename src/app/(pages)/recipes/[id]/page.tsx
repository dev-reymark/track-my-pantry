"use client";

import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button, Link, Spinner } from "@heroui/react";

interface Recipe {
  name: string;
  prepTime: number;
  calories: number;
  ingredients: string[];
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
          <div className="p-6">
            <Spinner label="Loading recipe..." />
          </div>
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
            <strong>Ingredients:</strong> {recipe.ingredients.join(", ")}
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
