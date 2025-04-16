"use client";

import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Input,
  Table,
  TableBody,
  TableColumn,
  TableHeader,
  TableRow,
  TableCell,
  Button,
} from "@heroui/react";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/loader";
import toast from "react-hot-toast";
import { GoTrash } from "react-icons/go";

type PantryItem = {
  id: string;
  name: string;
  quantity?: number;
};

export default function MyPantry() {
  const { user } = useAuth();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, [user]);

  const fetchItems = async () => {
    if (!user) return;
    try {
      setLoading(true);

      const pantryRef = doc(db, "userPantry", user.uid);
      const pantrySnap = await getDoc(pantryRef);

      const selectedItemIds = pantrySnap.exists()
        ? pantrySnap.data()?.items || []
        : [];

      if (!selectedItemIds.length) {
        setItems([]);
        return;
      }

      const itemSnap = await getDocs(collection(db, "items"));
      const allItems = itemSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PantryItem[];

      const filtered = allItems.filter((item) =>
        selectedItemIds.includes(item.id)
      );

      setItems(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load pantry items.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!user) return;

    try {
      const pantryRef = doc(db, "userPantry", user.uid);
      const pantrySnap = await getDoc(pantryRef);

      if (!pantrySnap.exists()) return;

      const currentItems: string[] = pantrySnap.data().items || [];

      const updatedItems = currentItems.filter((id) => id !== itemId);

      await updateDoc(pantryRef, {
        items: updatedItems,
        updatedAt: new Date(),
      });

      setItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success("Item removed from pantry.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete item.");
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <ApplicationLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold">What&apos;s in your Pantry</h1>
          <p className="mt-2">Here is a list of items you have selected</p>

          {loading ? (
            <Loader />
          ) : (
            <Table
              isStriped
              className="mt-4"
              aria-label="Items in your pantry"
              topContent={
                <Input
                  className="w-full max-w-md"
                  placeholder="Search"
                  size="sm"
                  startContent={<SearchIcon size={14} />}
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              }
            >
              <TableHeader>
                <TableColumn>ITEM</TableColumn>
                <TableColumn className="text-right">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent={"No items found."} items={filteredItems}>
                {(item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="light"
                        color="danger"
                        isIconOnly
                        onPress={() => handleDelete(item.id)}
                      >
                        <GoTrash size={20} />
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
