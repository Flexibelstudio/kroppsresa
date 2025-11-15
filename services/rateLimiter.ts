const LOCAL_STORAGE_KEY = 'kroppsresa-limit';
const DAILY_LIMIT = 5;

interface RateLimitData {
  count: number;
  date: string; // YYYY-MM-DD
}

function getTodayString(): string {
  // Skapar en datumsträng i formatet YYYY-MM-DD oberoende av tidszon.
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Kontrollerar om användaren har nått sin dagliga gräns för genereringar.
 * @returns Ett objekt med { canGenerate: boolean, remaining: number }
 */
function checkGenerationLimit(): { canGenerate: boolean; remaining: number } {
  const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  const today = getTodayString();

  if (!storedData) {
    return { canGenerate: true, remaining: DAILY_LIMIT };
  }

  try {
    const data: RateLimitData = JSON.parse(storedData);
    
    // Om det är en ny dag, nollställ gränsen.
    if (data.date !== today) {
      return { canGenerate: true, remaining: DAILY_LIMIT };
    }

    // Om räknaren har nått gränsen.
    if (data.count >= DAILY_LIMIT) {
      return { canGenerate: false, remaining: 0 };
    }
    
    // Annars, returnera återstående antal.
    return { canGenerate: true, remaining: DAILY_LIMIT - data.count };

  } catch (e) {
    console.error("Kunde inte tolka rate limit-data från localStorage", e);
    // Om datan är korrupt, återställ den för användaren.
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return { canGenerate: true, remaining: DAILY_LIMIT };
  }
}

/**
 * Registrerar en ny generering i localStorage och ökar räknaren för dagen.
 */
function recordGeneration(): void {
  const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  const today = getTodayString();
  let currentCount = 0;

  if (storedData) {
    try {
      const data: RateLimitData = JSON.parse(storedData);
      if (data.date === today) {
        currentCount = data.count;
      }
      // Om datumet inte matchar, är currentCount 0, vilket nollställer räknaren för den nya dagen.
    } catch (e) {
      // Ignorera korrupt data, den kommer att skrivas över.
    }
  }

  const newData: RateLimitData = {
    count: currentCount + 1,
    date: today,
  };

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
}

export { checkGenerationLimit, recordGeneration };
