// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD0_EbydGyTGNAQKLX9FHZsRR9DMlINEj4",
    authDomain: "track-my-pantry-d252e.firebaseapp.com",
    projectId: "track-my-pantry-d252e",
    storageBucket: "track-my-pantry-d252e.firebasestorage.app",
    messagingSenderId: "630026693990",
    appId: "1:630026693990:web:00cebe1dc8c99370206ca7",
    measurementId: "G-TRVPRPXHFX"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
