"use client"

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";
import { useState, useEffect } from "react";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCPxZ2Kpx4umDHGeShngCoExh50jdpxihQ",
  authDomain: "nccu-113-2-ac9c5.firebaseapp.com",
  databaseURL: "https://nccu-113-2-ac9c5-default-rtdb.firebaseio.com",
  projectId: "nccu-113-2-ac9c5",
  storageBucket: "nccu-113-2-ac9c5.firebasestorage.app",
  messagingSenderId: "710277269049",
  appId: "1:710277269049:web:5f2f8203e696ebf3f02fe8",
  measurementId: "G-2D8L3DSVQN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export const db = getFirestore(app);

export default function Mapbox() {
  const [shops, setShops] = useState([]);
  useEffect(() => {
    const q = collection(db, "shops");
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const shopArr = [];
      querySnapshot.forEach((doc) => {
        shopArr.push({ id: doc.id, ...doc.data() });
      });
      setShops(shopArr);
    });
    return () => unsubscribe();
  }, []);
}