"use client";

import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Input, Button, Select, SelectItem, Textarea } from "@heroui/react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Item {
  id: string;
  name: string;
}

interface Ingredient {
  id: string | null;
  name: string;
}

export default function AddRecipe() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(
    []
  );
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [prepTime, setPrepTime] = useState("");
  const [tags, setTags] = useState("");
  const [ingredientType, setIngredientType] = useState("");
  const [calories, setCalories] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      const snapshot = await getDocs(collection(db, "items"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { name: string }),
      }));
      setAvailableItems(data);
    };
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedIngredientIds.length || !prepTime || !description) {
      return toast.error("Please fill in all required fields.");
    }

    const selectedIngredients: Ingredient[] = selectedIngredientIds.map(
      (id) => {
        const item = availableItems.find((i) => i.id === id);
        return item ? { id: item.id, name: item.name } : { id: null, name: "" };
      }
    );

    setLoading(true);
    try {
      await addDoc(collection(db, "recipes"), {
        name: name.trim(),
        ingredients: selectedIngredients,
        prepTime: parseInt(prepTime),
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        ingredientType,
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
              selectedKeys={selectedIngredientIds}
              onSelectionChange={(keys) =>
                setSelectedIngredientIds(Array.from(keys) as string[])
              }
              isRequired
            >
              {availableItems
                .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically A-Z
                .map((item) => (
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
            <div className="flex gap-2">
              <Button type="submit" color="primary" isLoading={loading}>
                {loading ? "Adding..." : "Add Recipe"}
              </Button>
              <Button
                variant="flat"
                className="mb-4"
                onPress={() => router.back()}
                color="warning"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
