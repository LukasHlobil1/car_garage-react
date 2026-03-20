import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const initAuth = () => {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                resolve(user);
            } else {
                const { user } = await signInAnonymously(auth);
                resolve(user);
            }
        });
    });
};

export const getCars = async (userId) => {
    const carsRef = collection(db, `users/${userId}/cars`);
    const snapshot = await getDocs(carsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateCarStatus = async (userId, carId, status) => {
    const carRef = doc(db, `users/${userId}/cars/${carId}`);
    await updateDoc(carRef, {
        ...status,
        lastUpdated: new Date().toISOString()
    });
};

export const saveCarHistory = async (userId, carId, data) => {
    const historyRef = collection(db, `users/${userId}/cars/${carId}/history`);
    const newDocRef = doc(historyRef);
    await setDoc(newDocRef, {
        ...data,
        timestamp: new Date().toISOString()
    });
};