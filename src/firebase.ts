import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBJ6BvCHmaEcoHbaEPYxASItJlfLhParYc",
  authDomain: "sim-offer-shop-c6236.firebaseapp.com",
  databaseURL: "https://sim-offer-shop-c6236-default-rtdb.firebaseio.com",
  projectId: "sim-offer-shop-c6236",
  storageBucket: "sim-offer-shop-c6236.firebasestorage.app",
  messagingSenderId: "800449608061",
  appId: "1:800449608061:web:feb67cb4119f1539f47414",
  measurementId: "2HNBJEJV5"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getDatabase(app);
