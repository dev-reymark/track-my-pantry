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
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from "@heroui/react";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/loader";
import toast from "react-hot-toast";

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

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const mealTypes = ["breakfast", "lunch", "dinner"];

export default function Recipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPrepTimes, setSelectedPrepTimes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
        setLoading(false);
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

  const handleAddToMealPlan = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    onOpen(); // open modal
  };

  const saveToMealPlan = async (onClose: () => void) => {
    if (!selectedRecipe || !selectedDay || !selectedMealType || !user?.uid)
      return;

    setSaving(true);
    try {
      await addDoc(collection(db, "mealPlans"), {
        userId: user.uid,
        day: selectedDay,
        mealType: selectedMealType,
        recipeId: selectedRecipe.id,
        recipeName: selectedRecipe.name,
        calories: selectedRecipe.calories,
        timestamp: new Date(),
      });

      toast.success("Recipe added to meal plan!");
      onClose();
      setSelectedDay(null);
      setSelectedMealType(null);
      setSelectedRecipe(null);
    } catch {
      toast.error("Error saving meal plan");
    } finally {
      setSaving(false);
    }
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
                <CardHeader className="flex justify-between font-semibold text-lg">
                  {recipe.name}
                  <Button
                    className="z-50"
                    color="success"
                    variant="flat"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToMealPlan(recipe);
                    }}
                  >
                    Add to Meal Plan
                  </Button>
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

        {/* Modal for Adding to Meal Plan */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Add to Meal Plan</ModalHeader>
                <ModalBody className="space-y-4">
                  <Select
                    label="Select Day"
                    selectedKeys={selectedDay ? [selectedDay] : []}
                    onSelectionChange={(keys) =>
                      setSelectedDay(Array.from(keys)[0] as string)
                    }
                  >
                    {days.map((day) => (
                      <SelectItem key={day}>{day}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Select Meal Type"
                    selectedKeys={selectedMealType ? [selectedMealType] : []}
                    onSelectionChange={(keys) =>
                      setSelectedMealType(Array.from(keys)[0] as string)
                    }
                  >
                    {mealTypes.map((type) => (
                      <SelectItem key={type}>{type}</SelectItem>
                    ))}
                  </Select>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    isLoading={saving}
                    isDisabled={!selectedDay || !selectedMealType}
                    onPress={() => saveToMealPlan(onClose)}
                  >
                    Add to Meal Plan
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
