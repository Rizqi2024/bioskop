import { initializeApp, getApps, getApp } from "firebase/app";
// @ts-ignore - getReactNativePersistence exists at runtime via Metro RN bundle resolution
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCAEpiOiHt4Ll6Joan41JkMgpjGIXIUyWE",
    authDomain: "dbbioskop-1c56d.firebaseapp.com",
    projectId: "dbbioskop-1c56d",
    storageBucket: "dbbioskop-1c56d.firebasestorage.app",
    messagingSenderId: "1089704588295",
    appId: "1:1089704588295:web:91677fa05449639a2026a2",
    measurementId: "G-22CRW81ZBT"
};

// Guard against duplicate app initialization (hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth initialization strategy:
// 1. COLD START → initializeAuth() succeeds, creates auth WITH AsyncStorage persistence
// 2. HOT RELOAD → initializeAuth() throws "auth/already-initialized",
//    we catch it and reuse the existing instance via getAuth()
//    (which already has persistence from the initial cold start)
//
// NOTE: We CANNOT use getAuth() first because it auto-creates auth WITHOUT persistence,
// which is exactly the warning Firebase shows about missing AsyncStorage.
let auth: ReturnType<typeof getAuth>;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch {
  // auth/already-initialized during hot reload — reuse existing instance
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
