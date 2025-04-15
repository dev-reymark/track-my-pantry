"use client";

import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Input, Textarea, Button, Select, SelectItem } from "@heroui/react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Define the Item type
interface Item {
  id: string;
  name: string;
  // Add any other fields that are part of the item
}

export default function AddRecipe() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]); // ingredients should be an array
  const [availableItems, setAvailableItems] = useState<Item[]>([]); // Type for available items
  const [prepTime, setPrepTime] = useState("");
  const [tags, setTags] = useState("");
  const [ingredientType, setIngredientType] = useState("");
  const [calories, setCalories] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch pantry items
  useEffect(() => {
    const fetchItems = async () => {
      const snapshot = await getDocs(collection(db, "items"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Item[]; // Type assertion for the fetched items
      setAvailableItems(data);
    };

    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ingredients.length || !prepTime || !description) {
      return toast.error("Please fill in all required fields.");
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "recipes"), {
        name: name.trim(),
        ingredients,
        prepTime: parseInt(prepTime),
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        ingredientType: ingredientType,
        calories: calories ? parseInt(calories) : 0,
        description: description.trim(),
        createdAt: new Date(),
      });

      toast.success("Recipe added!");
      router.push("/recipes");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <ApplicationLayout>
        <div className="p-6 max-w-2xl">
          <Button
            variant="flat"
            className="mb-4"
            onPress={() => router.back()}
            color="primary"
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold mb-4">Add a New Recipe</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Recipe Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isRequired
            />
            <Select
              label="Ingredients"
              selectionMode="multiple"
              selectedKeys={ingredients}
              onSelectionChange={
                (keys) => setIngredients(Array.from(keys) as string[]) // Update to be an array of strings
              }
              isRequired
            >
              {availableItems.map((item) => (
                <SelectItem key={item.id}>{item.name}</SelectItem>
              ))}
            </Select>
            <Input
              label="Preparation Time (mins)"
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              isRequired
            />
            <Input
              label="Tags (optional, comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <Select
              label="Ingredient Type"
              selectedKeys={[ingredientType]}
              onSelectionChange={(keys) =>
                setIngredientType(Array.from(keys)[0] as string)
              }
              isRequired
            >
              <SelectItem key="Leftover Recipes">Leftover Recipes</SelectItem>
              <SelectItem key="From Scratch">From Scratch</SelectItem>
            </Select>
            <Input
              label="Calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
            <Textarea
              label="Preparation Steps / Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minRows={5}
              isRequired
            />

            <Button type="submit" color="primary" isLoading={loading}>
              {loading ? "Adding..." : "Add Recipe"}
            </Button>
          </form>
        </div>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
