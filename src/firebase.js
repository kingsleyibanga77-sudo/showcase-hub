import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAriDX-oFW1sVBpvSZabWwKuqCTOPXz1xA",
  authDomain: "showcase-hub-ca4fa.firebaseapp.com",
  projectId: "showcase-hub-ca4fa",
  storageBucket: "showcase-hub-ca4fa.firebasestorage.app",
  messagingSenderId: "58989260058",
  appId: "1:58989260058:web:16a9975f5b7b00bdd190a3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);