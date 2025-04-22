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
  Tooltip,
  addToast,
  cn,
} from "@heroui/react";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/loader";
import toast from "react-hot-toast";
import { GoTrash } from "react-icons/go";

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
  const [pantryItems, setPantryItems] = useState<string[]>([]); // Pantry items

  // Modal state
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPantryItems = async () => {
      if (!user) return;
      try {
        const pantryRef = doc(db, "userPantry", user.uid);
        const pantrySnap = await getDoc(pantryRef);
        if (pantrySnap.exists()) {
          setPantryItems(pantrySnap.data()?.items || []);
        }
      } catch (error) {
        console.error("Error fetching pantry items:", error);
      }
    };

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

    fetchPantryItems();
    fetchRecipes();
  }, [user]);

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

  const getMissingIngredients = (recipe: Recipe) => {
    return recipe.ingredients.filter(
      (ingredient) => !pantryItems.includes(ingredient.id || "")
    );
  };

  const confirmDeleteToast = (): Promise<boolean> => {
    return new Promise((resolve) => {
      addToast({
        title: "Are you sure?",
        description: "This will permanently delete the recipe.",
        classNames: {
          base: cn([
            "bg-default-50 dark:bg-background shadow-sm",
            "border border-l-8 rounded-md rounded-l-none",
            "flex flex-col items-start",
            "border-danger-200 dark:border-danger-100 border-l-danger",
          ]),
          icon: "w-6 h-6 fill-current",
        },
        endContent: (
          <div className="ms-11 my-2 flex gap-x-2">
            <Button
              color="danger"
              size="sm"
              variant="solid"
              onPress={() => resolve(true)}
            >
              Delete
            </Button>
          </div>
        ),
        color: "danger",
      });
    });
  };

  const handleDeleteRecipe = async (id: string) => {
    const confirmed = await confirmDeleteToast();
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "recipes", id));
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      addToast({
        title: "Deleted",
        description: "Recipe has been removed.",
        color: "success",
      });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      addToast({
        title: "Error",
        description: "Failed to delete the recipe.",
        color: "danger",
      });
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => {
              const missingIngredients = getMissingIngredients(recipe);
              return (
                <div key={recipe.id}>
                  <Card>
                    <CardHeader className="flex justify-between font-semibold text-lg">
                      <Link underline="hover" href={`/recipes/${recipe.id}`}>
                        {recipe.name}
                      </Link>
                      <div className="flex gap-2">
                        <Button
                          color="success"
                          variant="flat"
                          size="sm"
                          onPress={() => handleAddToMealPlan(recipe)}
                        >
                          Add to Meal Plan
                        </Button>
                        {user?.role === "admin" && (
                          <Tooltip
                            color="danger"
                            placement="right"
                            content="Delete Recipe"
                            showArrow={true}
                          >
                            <Button
                              color="danger"
                              variant="light"
                              size="sm"
                              isIconOnly
                              onPress={() => handleDeleteRecipe(recipe.id)}
                            >
                              <GoTrash size={16} />
                            </Button>
                          </Tooltip>
                        )}
                      </div>
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
                        {missingIngredients.length > 0 ? (
                          <span className="text-red-600 font-medium">
                            {missingIngredients
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
                        <strong>Tags:</strong>{" "}
                        {recipe.tags?.join(", ") || "None"}
                      </div>
                      <div>
                        <strong>Description:</strong> {recipe.description}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              );
            })}
          </div>

          {filteredRecipes.length === 0 && (
            <p className="text-gray-500 mt-4">No recipes found.</p>
          )}
        </div>

        {/* Modal for Adding to Meal Plan */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            <ModalHeader>Add to Meal Plan</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <Select
                  value={selectedDay || ""}
                  onChange={(event) =>
                    setSelectedDay((event.target.value as string) || null)
                  }
                  label="Day"
                >
                  {days.map((day) => (
                    <SelectItem key={day}>{day}</SelectItem>
                  ))}
                </Select>
                <Select
                  value={selectedMealType || ""}
                  onChange={(event) =>
                    setSelectedMealType((event.target.value as string) || null)
                  }
                  label="Meal Type"
                >
                  {mealTypes.map((meal) => (
                    <SelectItem key={meal}>{meal}</SelectItem>
                  ))}
                </Select>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="warning"
                onPress={onOpenChange}
                variant="flat"
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                color="success"
                onPress={() => saveToMealPlan(() => onOpenChange())}
                isLoading={saving}
              >
                Save to Meal Plan
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
