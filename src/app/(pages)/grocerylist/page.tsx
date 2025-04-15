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
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function GroceryList() {
  const [groceryItems, setGroceryItems] = useState<string[]>([]);
  const [customItem, setCustomItem] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged(async (authUser) => {
      if (!authUser) return;

      const mealPlanRef = collection(db, "mealPlans");
      const q = query(mealPlanRef, where("userId", "==", authUser.uid));
      const mealSnapshot = await getDocs(q);
      const recipeIds = Array.from(
        new Set(mealSnapshot.docs.map((doc) => doc.data().recipeId))
      );

      const allIngredients: string[] = [];

      for (const recipeId of recipeIds) {
        const recipeRef = doc(db, "recipes", recipeId);
        const recipeSnap = await getDoc(recipeRef);
        if (recipeSnap.exists()) {
          const data = recipeSnap.data();
          if (Array.isArray(data.ingredients)) {
            allIngredients.push(...data.ingredients);
          }
        }
      }

      // Fetch custom grocery items
      const customItemsSnapshot = await getDocs(
        collection(db, `users/${authUser.uid}/customGroceryItems`)
      );
      const customItems = customItemsSnapshot.docs.map(
        (doc) => doc.data().name
      );

      const combined = [...allIngredients, ...customItems];
      const unique = Array.from(new Set(combined)).sort();

      setGroceryItems(unique);
    });

    return () => unsubscribe();
  }, []);

  const handleAddCustomItem = async (onClose: () => void) => {
    if (!customItem.trim() || !user?.uid) return;

    await addDoc(collection(db, `users/${user.uid}/customGroceryItems`), {
      name: customItem.trim(),
      createdAt: new Date(),
    });

    setGroceryItems((prev) =>
      Array.from(new Set([...prev, customItem.trim()])).sort()
    );

    setCustomItem("");
    onClose();
  };

  return (
    <ProtectedRoute>
      <ApplicationLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold">Grocery List</h1>
          <p>Missing items to buy based on your one-week meal plan.</p>

          <Table
            className="mt-4"
            aria-label="Grocery List"
            topContent={
              <div>
                <Button color="primary" onPress={onOpen}>
                  Add Item
                </Button>
              </div>
            }
          >
            <TableHeader>
              <TableColumn>ITEMS</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"No items needed. You're fully stocked!"}>
              {groceryItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Modal to add custom grocery item */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Add Grocery Item</ModalHeader>
                <ModalBody>
                  <Input
                    label="Item Name"
                    value={customItem}
                    onChange={(e) => setCustomItem(e.target.value)}
                    placeholder="e.g., Milk, Eggs, Snacks"
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => handleAddCustomItem(onClose)}
                    isDisabled={!customItem.trim()}
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
