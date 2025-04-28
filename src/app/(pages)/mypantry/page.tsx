"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  Button,
  Table,
  TableBody,
  TableColumn,
  TableHeader,
  TableRow,
  TableCell,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
} from "@heroui/react";
import toast from "react-hot-toast";
import Loader from "@/components/loader";
import { GoTrash } from "react-icons/go";
import { SearchIcon } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ApplicationLayout from "@/components/layout/ApplicationLayout";
import { FcExpired } from "react-icons/fc";

type PantryItem = {
  id: string;
  name: string;
  quantity?: number;
  expiryDate?: string;
};

interface Entry {
  id: string;
  expiryDate?: string;
}

export default function MyPantry() {
  const { user } = useAuth();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<string>("");

  useEffect(() => {
    fetchItems();
  }, [user]);

  const fetchItems = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const pantryRef = doc(db, "userPantry", user.uid);
      const pantrySnap = await getDoc(pantryRef);

      const selectedItems = pantrySnap.exists()
        ? pantrySnap.data()?.items || []
        : [];

      if (!selectedItems.length) {
        setItems([]);
        return;
      }

      const itemSnap = await getDocs(collection(db, "items"));
      const allItems = itemSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PantryItem[];

      const filtered = selectedItems
        .map((entry: Entry) => {
          const id = typeof entry === "string" ? entry : entry.id;
          const expiryDate =
            typeof entry === "object" ? entry.expiryDate : null;

          const foundItem = allItems.find((item) => item.id === id);

          if (foundItem) {
            return { ...foundItem, expiryDate };
          }
          return null;
        })
        .filter(Boolean) as PantryItem[];

      // Filter out expired items or those expiring in 7 days
      const today = new Date();
      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);

      const validItems = filtered.filter((item) => {
        if (item.expiryDate) {
          const expiry = new Date(item.expiryDate);
          if (expiry <= today) {
            handleDelete(item.id); // Delete expired item
            return false;
          }
          // else if (expiry <= sevenDaysFromNow) {
          //   toast.error(`${item.name} is expiring soon!`);
          // }
        }
        return true;
      });

      setItems(validItems);
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

      const currentItems: PantryItem[] = pantrySnap.data().items || [];

      const updatedItems = currentItems.filter((item) => item.id !== itemId);

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

  const handleSetExpiry = async (itemId: string) => {
    setSelectedItemId(itemId);
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    if (!user || !selectedItemId || !expiryDate) return;

    try {
      const pantryRef = doc(db, "userPantry", user.uid);
      const pantrySnap = await getDoc(pantryRef);

      if (!pantrySnap.exists()) return;

      const currentItems: PantryItem[] = pantrySnap.data().items || [];

      const updatedItems = currentItems.map((item) =>
        item.id === selectedItemId ? { ...item, expiryDate } : item
      );

      await updateDoc(pantryRef, {
        items: updatedItems,
        updatedAt: new Date(),
      });

      setItems((prev) =>
        prev.map((item) =>
          item.id === selectedItemId ? { ...item, expiryDate } : item
        )
      );

      setShowModal(false);
      toast.success("Expiry date updated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to set expiry date.");
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    return expiry <= sevenDaysFromNow && expiry >= today;
  };

  return (
    <>
      <ProtectedRoute>
        <ApplicationLayout>
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold">What&apos;s in your Pantry</h1>
            <p className="mt-2">
              Here is a list of items you have in your pantry
            </p>

            {loading ? (
              <Loader />
            ) : (
              <Table
                isStriped
                className="mt-4"
                aria-label="Items in your pantry"
                topContent={
                  <Input
                    className="w-full max-w-sm"
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
                  <TableColumn>EXPIRY DATE</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody
                  emptyContent={"No items found."}
                  items={filteredItems}
                >
                  {(item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        {item.expiryDate}{" "}
                        {item.expiryDate && isExpiringSoon(item.expiryDate) && (
                          <Chip
                            className="border-none gap-1 text-default-600"
                            size="sm"
                            variant="dot"
                            color="warning"
                          >
                            Expiring soon
                          </Chip>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="light"
                          size="sm"
                          isIconOnly
                          onPress={() => handleSetExpiry(item.id)}
                        >
                          <FcExpired size={20} />
                        </Button>
                        <Button
                          variant="light"
                          color="danger"
                          size="sm"
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

      {/* Modal for setting expiry */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Set Expiry Date
              </ModalHeader>
              <ModalBody>
                <label htmlFor="expiryDate">Expiry Date (optional)</label>
                <input
                  min={new Date().toISOString().split("T")[0]} // Prevent past dates
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  variant="flat"
                  onPress={handleModalSubmit}
                  color="primary"
                >
                  Set
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
