import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { type UserData, type GoalData } from '../types';

// VIKTIGT: Dessa variabler måste finnas i er deploymentsmiljö (t.ex. Netlify, Vercel).
// I AI Studio kommer de att vara odefinierade, och då är statistiken automatiskt avstängd.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID, // t.ex. "kroppsresa"
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let db: any = null;

// Initiera Firebase endast om alla nödvändiga konfigurationsvärden finns
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (e) {
    console.error("Firebase-initiering misslyckades. Statistik är avstängd.", e);
    db = null; // säkerställ att db är null vid fel
  }
} else {
  // Detta är förväntat i AI Studio eller lokal utveckling utan en .env-fil
  console.info("Firebase-konfiguration hittades inte. Statistik är avstängd.");
}

/**
 * Loggar en genereringshändelse till Firebase för statistiska ändamål.
 * Detta är en "fire-and-forget"-funktion. Den kommer inte att kasta fel
 * och kommer att misslyckas tyst om Firebase inte är konfigurerat.
 * @param userData Användarens indata.
 * @param goalData Användarens måldata.
 */
export const logGenerationEvent = (userData: UserData, goalData: GoalData): void => {
  if (!db) {
    return; // Avsluta tyst om Firebase inte är initierat
  }

  // Skapa en ren kopia av data för att säkerställa att vi inte skickar något extra.
  const dataToLog = {
    userData: {
        height: userData.height || 0,
        weight: userData.weight || 0,
        bodyFat: userData.bodyFat || 0,
        muscleMass: userData.muscleMass || 0,
        gender: userData.gender || 'unknown',
        age: userData.age || 0,
    },
    goalData: {
        goalWeight: goalData.goalWeight || 0,
        goalBodyFat: goalData.goalBodyFat || 0,
        goalMuscleMass: goalData.goalMuscleMass || 0,
    },
    createdAt: serverTimestamp(),
  };

  addDoc(collection(db, 'generations'), dataToLog)
    .catch(error => {
      // Logga felet till konsolen för felsökning, men låt det inte påverka användaren.
      console.error("Fel vid loggning av statistikhändelse till Firebase:", error);
    });
};