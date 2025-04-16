"use client";

import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Button,
  Input,
  Link,
  Card,
  CardHeader,
  CardBody,
  CheckboxGroup,
  Checkbox,
} from "@heroui/react";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/loader"; // Make sure this exists

interface Ingredient {
  id: string | null;
  name: string;
}

interface Recipe {
  id: string;
  name: string;
  prepTime: number;
  calories: number;
  ingredients: Ingredient[];
  ingredientType: string;
  tags?: string[];
  description: string;
}

export default function Recipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPrepTimes, setSelectedPrepTimes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const snapshot = await getDocs(collection(db, "recipes"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Recipe[];
        setRecipes(data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setLoading(false); // ✅ Set loading to false regardless of outcome
      }
    };

    fetchRecipes();
  }, []);

  const tagOptions = Array.from(new Set(recipes.flatMap((r) => r.tags || [])));
  const typeOptions = Array.from(new Set(recipes.map((r) => r.ingredientType)));

  const matchesFilters = (recipe: Recipe) => {
    const matchesPrepTime =
      selectedPrepTimes.length === 0 ||
      selectedPrepTimes.some((range) => {
        const time = recipe.prepTime;
        if (range === "<10") return time < 10;
        if (range === "10-30") return time >= 10 && time <= 30;
        if (range === ">30") return time > 30;
        return true;
      });

    const matchesTags =
      selectedTags.length === 0 ||
      (recipe.tags || []).some((tag) => selectedTags.includes(tag));

    const matchesType =
      selectedTypes.length === 0 ||
      selectedTypes.includes(recipe.ingredientType);

    return (
      recipe.name.toLowerCase().includes(search.toLowerCase()) &&
      matchesPrepTime &&
      matchesTags &&
      matchesType
    );
  };

  const filteredRecipes = recipes.filter(matchesFilters);

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
          <h1 className="text-2xl font-bold">Browse our Recipes</h1>
          <p>Filter by time, mains, and our special filters.</p>

          <Input
            className="w-full max-w-md my-4"
            placeholder="Search"
            size="sm"
            startContent={<SearchIcon size={14} />}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {user?.role === "admin" && (
            <Button
              as={Link}
              href="/recipes/addrecipe"
              color="primary"
              className="mb-6"
            >
              Add Recipe
            </Button>
          )}

          {/* Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Preparation Time</h2>
              <CheckboxGroup
                orientation="horizontal"
                value={selectedPrepTimes}
                onValueChange={setSelectedPrepTimes}
              >
                <Checkbox value="<10">Less than 10 mins</Checkbox>
                <Checkbox value="10-30">10 to 30 mins</Checkbox>
                <Checkbox value=">30">More than 30 mins</Checkbox>
              </CheckboxGroup>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Tags</h2>
              <CheckboxGroup
                orientation="horizontal"
                value={selectedTags}
                onValueChange={setSelectedTags}
              >
                {tagOptions.map((tag) => (
                  <Checkbox key={tag} value={tag}>
                    {tag}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Ingredient Type</h2>
              <CheckboxGroup
                orientation="horizontal"
                value={selectedTypes}
                onValueChange={setSelectedTypes}
              >
                {typeOptions.map((type) => (
                  <Checkbox key={type} value={type}>
                    {type}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecipes.map((recipe) => (
              <Card
                isPressable
                as={Link}
                href={`/recipes/${recipe.id}`}
                key={recipe.id}
              >
                <CardHeader className="font-semibold text-lg">
                  {recipe.name}
                </CardHeader>
                <CardBody className="text-sm space-y-2">
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
                    <strong>Tags:</strong> {recipe.tags?.join(", ") || "None"}
                  </div>
                  <div>
                    <strong>Description:</strong> {recipe.description}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {filteredRecipes.length === 0 && (
            <p className="text-gray-500 mt-4">No recipes found.</p>
          )}
        </div>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
