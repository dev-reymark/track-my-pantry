"use client";

import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from "@heroui/react";
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import toast from "react-hot-toast";

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

interface Recipe {
  id: string;
  name: string;
  calories: number;
}

interface MealPlan {
  id: string;
  day: string;
  mealType: string;
  recipeName: string;
  calories: number;
}

export default function MealPlanTable() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchRecipes = async () => {
      const snapshot = await getDocs(collection(db, "recipes"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Recipe[];
      setRecipes(data);
    };

    fetchRecipes();
  }, []);

  useEffect(() => {
    const fetchMealPlan = async () => {
      if (!user?.uid) return;

      const q = query(
        collection(db, "mealPlans"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          day: d.day,
          mealType: d.mealType,
          recipeName: d.recipeName,
          calories: d.calories,
        };
      }) as MealPlan[];

      setMealPlan(data);
    };

    fetchMealPlan();
  }, [user]);

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId) || null;

  const handleAddMeal = async (onClose: () => void) => {
    if (selectedDay && selectedMealType && selectedRecipe && user?.uid) {
      setLoading(true);
      try {
        const newMeal = {
          userId: user.uid,
          day: selectedDay,
          mealType: selectedMealType,
          recipeId: selectedRecipe.id,
          recipeName: selectedRecipe.name,
          calories: selectedRecipe.calories,
          timestamp: new Date(),
        };

        const docRef = await addDoc(collection(db, "mealPlans"), newMeal);

        setMealPlan((prev) => [
          ...prev,
          {
            id: docRef.id, // ✅ Include the ID from Firestore
            day: selectedDay,
            mealType: selectedMealType,
            recipeName: selectedRecipe.name,
            calories: selectedRecipe.calories,
          },
        ]);

        toast.success("Meal added!");
        setSelectedDay(null);
        setSelectedMealType(null);
        setSelectedRecipeId(null);
        onClose();
      } catch (err) {
        console.error("Failed to add meal:", err);
        toast.error("Something went wrong. Try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const getMeal = (day: string, type: string) =>
    mealPlan.find((m) => m.day === day && m.mealType === type);

  const handleDeleteMeal = async (id: string) => {
    try {
      await deleteDoc(doc(db, "mealPlans", id));
      setMealPlan((prev) => prev.filter((m) => m.id !== id));
      toast.success("Meal deleted!");
    } catch (err) {
      console.error("Failed to delete meal:", err);
      toast.error("Failed to delete meal.");
    }
  };

  return (
    <ProtectedRoute>
      <ApplicationLayout>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Weekly Meal Plan</h1>
            <Button color="primary" onPress={onOpen}>
              Add Meal
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr>
                  <th className="border p-2 text-left bg-gray-100">
                    Meal Type
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="border p-2 text-center bg-gray-100"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mealTypes.map((mealType) => (
                  <tr key={mealType}>
                    <td className="border p-2 capitalize font-semibold">
                      {mealType}
                    </td>
                    {days.map((day) => {
                      const meal = getMeal(day, mealType);
                      return (
                        <td
                          key={`${day}-${mealType}`}
                          className="border p-2 text-sm text-center"
                        >
                          {meal ? (
                            <div className="relative">
                              <button
                                onClick={() => handleDeleteMeal(meal.id)}
                                className="absolute top-0 right-0 text-red-500 hover:text-red-700 text-xs"
                                title="Delete"
                              >
                                ✕
                              </button>
                              <div className="font-medium">
                                {meal.recipeName}
                              </div>
                              <div className="text-gray-500">
                                {meal.calories} cal
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">--</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Meal Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Add Meal</ModalHeader>
                <ModalBody className="space-y-4">
                  <Select
                    isRequired
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
                    isRequired
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

                  <Select
                    isRequired
                    label="Select Recipe"
                    selectedKeys={selectedRecipeId ? [selectedRecipeId] : []}
                    onSelectionChange={(keys) =>
                      setSelectedRecipeId(Array.from(keys)[0] as string)
                    }
                  >
                    {recipes.map((recipe) => (
                      <SelectItem key={recipe.id}>{recipe.name}</SelectItem>
                    ))}
                  </Select>

                  {selectedRecipe && (
                    <Input
                      label="Calories"
                      value={selectedRecipe.calories.toString()}
                      isReadOnly
                    />
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    isLoading={loading}
                    color="primary"
                    onPress={() => handleAddMeal(onClose)}
                    isDisabled={
                      !selectedDay || !selectedMealType || !selectedRecipe
                    }
                  >
                    {loading ? "Adding..." : "Add Meal"}
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
