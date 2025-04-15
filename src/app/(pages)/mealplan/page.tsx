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
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import toast from "react-hot-toast";

// Define types for recipes and meal plan
interface Recipe {
  id: string;
  name: string;
  calories: number;
}

interface MealPlan {
  day: string;
  food: string;
  calories: number;
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

export default function MealPlan() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const auth = getAuth();
  const user = auth.currentUser;

  // Load Recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      const snapshot = await getDocs(collection(db, "recipes"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Recipe[]; // Typecast to Recipe[]
      setRecipes(data);
    };

    fetchRecipes();
  }, []);

  // Load Meal Plan from Firestore
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
          day: d.day,
          food: d.recipeName,
          calories: d.calories,
        };
      }) as MealPlan[]; // Typecast to MealPlan[]

      setMealPlan(data);
    };

    fetchMealPlan();
  }, [user]);

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId) || null;

  const handleAddMeal = async (onClose: () => void) => {
    if (selectedDay && selectedRecipe && user?.uid) {
      const newMeal = {
        userId: user.uid,
        day: selectedDay,
        recipeId: selectedRecipe.id,
        recipeName: selectedRecipe.name,
        calories: selectedRecipe.calories,
        timestamp: new Date(),
      };

      // Save to Firestore
      await addDoc(collection(db, "mealPlans"), newMeal);

      // Update UI
      setMealPlan((prev) => [
        ...prev,
        {
          day: selectedDay,
          food: selectedRecipe.name,
          calories: selectedRecipe.calories,
        },
      ]);

      toast.success("Meal added!");

      setSelectedDay(null);
      setSelectedRecipeId(null);
      onClose();
    }
  };

  const totalCaloriesPerDay = days.map((day) => {
    const total = mealPlan
      .filter((m) => m.day === day)
      .reduce((sum, m) => sum + Number(m.calories || 0), 0);
    return { day, calories: total };
  });

  return (
    <ProtectedRoute>
      <ApplicationLayout>
        <div className="p-6">
          <Table
            className="mt-4"
            aria-label="Weekly Meal Plan"
            topContent={
              <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Weekly Meal Plan</h1>
                <Button color="primary" onPress={onOpen}>
                  Add Meals
                </Button>
              </div>
            }
          >
            <TableHeader>
              <TableColumn>Food</TableColumn>
              <TableColumn>Day</TableColumn>
              <TableColumn>Calories</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"No rows to display."}>
              {mealPlan.map((meal, index) => (
                <TableRow key={index}>
                  <TableCell>{meal.food}</TableCell>
                  <TableCell>{meal.day}</TableCell>
                  <TableCell>{meal.calories}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Table className="mt-4" aria-label="Total Calories">
            <TableHeader>
              <TableColumn>Day</TableColumn>
              <TableColumn>Total Calories</TableColumn>
            </TableHeader>
            <TableBody>
              {totalCaloriesPerDay.map(({ day, calories }) => (
                <TableRow key={day}>
                  <TableCell>{day}</TableCell>
                  <TableCell>{calories}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Add Meals</ModalHeader>
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
                    color="primary"
                    onPress={() => handleAddMeal(onClose)}
                    isDisabled={!selectedDay || !selectedRecipe}
                  >
                    Add
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
