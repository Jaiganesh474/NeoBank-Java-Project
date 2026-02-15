import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAUv0iPTbgGcEYerEohWeHETTt-vHqHRP8",
    authDomain: "netflix-clone-67040.firebaseapp.com",
    projectId: "netflix-clone-67040",
    storageBucket: "netflix-clone-67040.firebasestorage.app",
    messagingSenderId: "1097726767607",
    appId: "1:1097726767607:web:6e1145306cc7634113bef2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken();
        return idToken;
    } catch (error) {
        console.error("Firebase Auth Error", error);
        throw error;
    }
};
