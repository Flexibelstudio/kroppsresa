import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { type UserData, type GoalData } from "../types";

// Hjälpfunktion som försöker läsa env-variabler på flera sätt
function getEnv(name: string): string | undefined {
  // Vite (import.meta.env)
  try {
    // @ts-ignore
    if (typeof import.meta !== "undefined" && import.meta.env) {
      // @ts-ignore
      const v = import.meta.env[name];
      if (typeof v === "string" && v.length > 0) return v;
    }
  } catch {
    // ignorera om import.meta inte finns (t.ex. i vissa verktyg)
  }

  // Node / build-miljöer (process.env)
  if (typeof process !== "undefined" && (process as any).env) {
    const v = (process as any).env[name];
    if (typeof v === "string" && v.length > 0) return v;
  }

  return undefined;
}

// Försök först med VITE_* (Vites standard), därefter utan prefix
const firebaseConfig = {
  apiKey:
    getEnv("VITE_FIREBASE_API_KEY") || getEnv("FIREBASE_API_KEY") || undefined,
  authDomain:
    getEnv("VITE_FIREBASE_AUTH_DOMAIN") ||
    getEnv("FIREBASE_AUTH_DOMAIN") ||
    undefined,
  projectId:
    getEnv("VITE_FIREBASE_PROJECT_ID") ||
    getEnv("FIREBASE_PROJECT_ID") ||
    undefined,
  storageBucket:
    getEnv("VITE_FIREBASE_STORAGE_BUCKET") ||
    getEnv("FIREBASE_STORAGE_BUCKET") ||
    undefined,
  messagingSenderId:
    getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID") ||
    getEnv("FIREBASE_MESSAGING_SENDER_ID") ||
    undefined,
  appId:
    getEnv("VITE_FIREBASE_APP_ID") || getEnv("FIREBASE_APP_ID") || undefined,
};

let app: FirebaseApp | null = null;
let db: any = null;

// Initiera Firebase endast om apiKey & projectId finns
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig as any);
    db = getFirestore(app);
    console.info(
      `[Firebase] Initierad med projekt: ${firebaseConfig.projectId}`
    );
  } catch (e) {
    console.error("Firebase-initiering misslyckades. Statistik är avstängd.", e);
    db = null;
  }
} else {
  console.info(
    "Firebase-konfiguration hittades inte (saknar apiKey eller projectId). Statistik är avstängd."
  );
}

/**
 * Loggar en genereringshändelse till Firebase för statistiska ändamål.
 * "Fire-and-forget": kastar inga fel utåt.
 */
export const logGenerationEvent = (
  userData: UserData,
  goalData: GoalData
): void => {
  if (!db) {
    // Ingen databas → gör inget
    return;
  }

  const dataToLog = {
    userData: {
      height: userData.height || 0,
      weight: userData.weight || 0,
      bodyFat: userData.bodyFat || 0,
      muscleMass: userData.muscleMass || 0,
      gender: userData.gender || "unknown",
      age: userData.age || 0,
    },
    goalData: {
      goalWeight: goalData.goalWeight || 0,
      goalBodyFat: goalData.goalBodyFat || 0,
      goalMuscleMass: goalData.goalMuscleMass || 0,
    },
    createdAt: serverTimestamp(),
  };

  addDoc(collection(db, "generations"), dataToLog).catch((error) => {
    console.error(
      "Fel vid loggning av statistikhändelse till Firebase:",
      error
    );
  });
};
