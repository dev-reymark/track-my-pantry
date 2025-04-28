import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface ExpirationEntry {
    id: string;
    expiryDate: string;
}

// interface StringEntry {
//     id: string;
// }

// type Entry = ExpirationEntry | StringEntry;

const useExpirationNotifier = () => {
    const { user } = useAuth();
    const [expiringItems, setExpiringItems] = useState<string[]>([]); // State to store expiring items
    const [expiredItems, setExpiredItems] = useState<string[]>([]); // State to store expired items

    useEffect(() => {
        const checkExpiryDates = async () => {
            if (!user) return;

            try {
                const pantryRef = doc(db, "userPantry", user.uid);
                const pantrySnap = await getDoc(pantryRef);
                const selectedItems = pantrySnap.exists() ? pantrySnap.data()?.items || [] : [];

                if (!selectedItems.length) return;

                const itemSnap = await getDocs(collection(db, "items"));
                const allItems = itemSnap.docs.map((doc) => ({ id: doc.id, name: doc.data().name, ...doc.data() }));

                const today = new Date();
                const sevenDaysFromNow = new Date(today);
                sevenDaysFromNow.setDate(today.getDate() + 7);

                const newExpiringItems: string[] = [];
                const newExpiredItems: string[] = [];

                selectedItems.forEach((entry: ExpirationEntry) => {
                    const id = typeof entry === "string" ? entry : entry.id;
                    const expiryDate = typeof entry === "object" ? entry.expiryDate : null;

                    const foundItem = allItems.find((item) => item.id === id);
                    if (foundItem && expiryDate) {
                        const expiry = new Date(expiryDate);
                        if (expiry <= today) {
                            newExpiredItems.push(foundItem.name);
                        } else if (expiry <= sevenDaysFromNow) {
                            newExpiringItems.push(foundItem.name);
                        }
                    }
                });

                setExpiredItems(newExpiredItems);
                setExpiringItems(newExpiringItems);
            } catch (err) {
                console.error("Error checking expiry dates:", err);
            }
        };

        checkExpiryDates();
    }, [user]);

    return { expiringItems, expiredItems };
};

export default useExpirationNotifier;
