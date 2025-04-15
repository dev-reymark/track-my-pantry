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
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { GoTrash } from "react-icons/go";

type PantryItem = {
  id: string;
  name: string;
  quantity: number;
};

export default function MyPantry() {
  const router = useRouter();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      const itemSnap = await getDocs(
        query(collection(db, "items"), orderBy("name"))
      );
      const itemData = itemSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PantryItem[];
      setItems(itemData);
    };

    fetchItems();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      // Delete the item from Firestore
      await deleteDoc(doc(db, "items", id));

      // Update the local state by removing the deleted item
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      toast.success("Item deleted!");
      router.push("/mypantry");
    } catch (error) {
      console.error("Error deleting item: ", error);
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
          <p className="mt-2">Here is a list of items in your pantry</p>

          <Table
            className="mt-4"
            aria-label="Items in your pantry"
            topContent={
              <Input
                className=" w-full max-w-md"
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
              <TableColumn>QUANTITY</TableColumn>
              <TableColumn>ACTION</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"No items found."} items={filteredItems}>
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <Button
                      onPress={() => handleDelete(item.id)}
                      color="danger"
                      variant="light"
                      isIconOnly
                    >
                      <GoTrash size={20} />
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
