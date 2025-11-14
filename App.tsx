import React, { useState, useEffect } from 'react';
import { type UserData, type GoalData, type StoredData } from './types';
import InputForm from './components/InputForm';
import ImagePreview from './components/ImagePreview';
import ResultView from './components/ResultView';
import { generateGoalImage } from './services/geminiService';
import FlexibelRecommendations from './components/FlexibelRecommendations';
import GoalTimeline from './components/GoalTimeline';
import { logGenerationEvent } from './services/analyticsService';

const initialUserData: UserData = {
  height: 0,
  weight: 0,
  bodyFat: 0,
  muscleMass: 0,
  gender: '',
  age: 0,
};

const initialGoalData: GoalData = {
  goalWeight: 0,
  goalBodyFat: 0,
  goalMuscleMass: 0,
};

const LOCAL_STORAGE_KEY = 'kroppsresa-data';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        viewBox="0 0 400 40"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-auto mx-auto"
        aria-label="Flexibel Hälsostudio logotyp"
        {...props}
    >
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#0aa5a1', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#088481', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize="24"
            fontWeight="800"
            fill="url(#logoGradient)"
        >
            Flexibel Hälsostudio
        </text>
    </svg>
);


function App() {
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [goalData, setGoalData] = useState<GoalData>(initialGoalData);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData: StoredData = JSON.parse(storedData);
        const userWithDefaults = { ...initialUserData, ...(parsedData.user || {}) };
        setUserData(userWithDefaults);
        setGoalData(parsedData.goal || initialGoalData);
        setOriginalImage(parsedData.originalImage || null);
      }
    } catch (e) {
      console.error("Failed to parse data from localStorage", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const dataToStore: StoredData = {
      user: userData,
      goal: goalData,
      originalImage: originalImage,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
  }, [userData, goalData, originalImage]);
  
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImage(reader.result as string);
      setGeneratedImage(null);
      setShowResults(false);
      setResultsVisible(false);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!originalImage) {
      setError("Vänligen ladda upp en bild.");
      return;
    }
    
    if (goalData.goalWeight <= 0) {
      setError("Målvikt måste vara ifylld och större än 0 för att kunna generera en bild.");
      return;
    }

    if (userData.age <= 0 || !userData.gender) {
      setError("Vänligen fyll i din ålder och kön för en mer korrekt visualisering.");
      return;
    }

    if (goalData.goalBodyFat && goalData.goalWeight && goalData.goalBodyFat > goalData.goalWeight) {
        setError("Fettmassan kan inte vara större än den totala målvikten.");
        return;
    }

    setError(null);
    setIsGenerating(true);
    setGeneratedImage(null);
    setShowResults(true); 
    setResultsVisible(false);

    try {
      const goalBodyFatPercentage = (goalData.goalBodyFat && goalData.goalWeight > 0) 
        ? (goalData.goalBodyFat / goalData.goalWeight) * 100 
        : undefined;
      
      const goalMuscleMass = goalData.goalMuscleMass && goalData.goalMuscleMass > 0 ? goalData.goalMuscleMass : undefined;

      const newImage = await generateGoalImage(
        originalImage, 
        userData.age, 
        userData.gender, 
        goalData.goalWeight, 
        goalBodyFatPercentage, 
        goalMuscleMass,
        userData.weight
      );
      setGeneratedImage(newImage);
      
      // Log anonymous data for statistical purposes. Fire-and-forget.
      logGenerationEvent(userData, goalData);

      setTimeout(() => setResultsVisible(true), 100);
    } catch (e: any) {
      console.error("Error generating image:", e);
      setError(`Kunde inte generera bild. Försök igen. Fel: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearData = () => {
    if (window.confirm("Är du säker på att du vill rensa all data?")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setUserData(initialUserData);
      setGoalData(initialGoalData);
      setOriginalImage(null);
      setGeneratedImage(null);
      setError(null);
      setShowResults(false);
      setResultsVisible(false);
    }
  };
  
  const beforeImage = originalImage;
  const afterImage = generatedImage;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <Logo />
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mt-4">Kroppsresa</h1>
          <p className="text-lg text-gray-600 mt-2">Visualisera din framtida form med AI</p>
        </header>

        <main className="space-y-10">
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-md transition-all duration-500">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-700">Berätta lite om dig själv</h2>
              <p className="text-gray-500 mt-1">...så visar vi hur din resa kan se ut.</p>
            </div>
            <InputForm
              data={userData}
              goalData={goalData}
              setData={setUserData}
              setGoalData={setGoalData}
              onImageUpload={handleImageUpload}
              onGenerate={handleGenerate}
              onClear={handleClearData}
              isGenerating={isGenerating}
              originalImage={originalImage}
            />
          </section>

          {showResults && (
            <section className={`bg-white rounded-2xl shadow-md transition-opacity duration-700 ease-in ${resultsVisible ? 'opacity-100' : 'opacity-0'}`}>
              <div className="p-6 md:p-8 space-y-8">
                <h2 className="text-3xl font-bold text-gray-800 text-center">Din Transformation</h2>
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p>{error}</p></div>}
                
                <ImagePreview 
                  originalImage={beforeImage} 
                  generatedImage={afterImage}
                  isGenerating={isGenerating} 
                />
                
                {generatedImage && <ResultView data={userData} goalData={goalData} />}
                {generatedImage && <GoalTimeline data={userData} goalData={goalData} />}
              </div>

              {generatedImage && (
                <div className="bg-teal-50/50 p-6 md:p-8 rounded-b-2xl mt-8">
                  <FlexibelRecommendations />
                  <div className="text-center mt-8">
                      <p className="text-gray-600 italic">“Vi tror på balans, glädje och långsiktig hälsa – inte quick fixes.”</p>
                      <p className="text-gray-500 font-medium mt-1">– Teamet på Flexibel Hälsostudio</p>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
        
        <footer className="text-center mt-12 py-4">
          <p className="text-sm text-gray-500">
            <strong className="font-semibold">Integritetsskydd:</strong> Dina bilder sparas endast lokalt på din enhet. Anonym data (utan bilder) kan samlas in för statistiska ändamål för att förbättra tjänsten.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;