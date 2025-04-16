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
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import toast from "react-hot-toast";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import * as dateFns from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { enUS } from "date-fns/locale";

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

// Calendar localization setup
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format: dateFns.format,
  parse: dateFns.parse,
  startOfWeek: () => dateFns.startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay: dateFns.getDay,
  locales,
});

export default function MealPlan() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const {
    isOpen: isEventDialogOpen,
    onOpen: openEventDialog,
    onOpenChange: onEventDialogChange,
  } = useDisclosure();

  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch Recipes
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

  // Fetch Meal Plan
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
      }) as MealPlan[];

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

      await addDoc(collection(db, "mealPlans"), newMeal);

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

  // Convert MealPlan to Calendar Events
  const mealEvents: Event[] = mealPlan.map((meal) => {
    const today = new Date();
    const startOfThisWeek = dateFns.startOfWeek(today, { weekStartsOn: 1 });
    const dayIndex = days.indexOf(meal.day); // Monday = 0
    const eventDate = dateFns.addDays(startOfThisWeek, dayIndex);

    const start = dateFns.set(eventDate, {
      hours: 12,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
    const end = dateFns.addHours(start, 1);

    return {
      title: `${meal.food} (${meal.calories} cal)`,
      start,
      end,
      allDay: false,
    };
  });

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

          <Calendar
            localizer={localizer}
            events={mealEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            views={["week", "day"]}
            defaultView="week"
            onSelectEvent={(event) => {
              setSelectedEvent(event);
              openEventDialog();
            }}
          />
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

        <Modal
          placement="center"
          isOpen={isEventDialogOpen}
          onOpenChange={onEventDialogChange}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>{selectedEvent?.title}</ModalHeader>
                <ModalBody className="space-y-2">
                  {selectedEvent && (
                    <>
                      <p>
                        <strong>Meal:</strong> {selectedEvent.title}
                      </p>
                    </>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button
                    size="sm"
                    variant="flat"
                    color="warning"
                    onPress={onClose}
                  >
                    Close
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
