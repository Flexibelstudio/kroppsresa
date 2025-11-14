
import React from 'react';
import { type UserData, type GoalData } from '../types';
import { BicepIcon, HeartPulseIcon, LightningBoltIcon, SparklesIcon } from './icons';

interface ResultViewProps {
  data: UserData;
  goalData: GoalData;
}

const calculateBMI = (weight: number, height: number): number => {
  if (height === 0 || weight === 0) return 0;
  return weight / ((height / 100) ** 2);
};

const formatNumber = (num: number): string => {
    const sign = num > 0 ? '+' : '';
    return sign + num.toFixed(1);
}

const ResultCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
    <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
);

const benefits = [
    {
        icon: <LightningBoltIcon className="w-8 h-8 text-yellow-500" />,
        title: "Mer Energi",
        description: "Känn dig piggare och starkare i vardagen.",
    },
    {
        icon: <SparklesIcon className="w-8 h-8 text-teal-500" />,
        title: "Ökat Självförtroende",
        description: "Stråla med nyvunnen självkänsla och stolthet.",
    },
    {
        icon: <BicepIcon className="w-8 h-8 text-red-500" />,
        title: "Starkare Kropp",
        description: "Bygg en funktionell och motståndskraftig fysik.",
    },
    {
        icon: <HeartPulseIcon className="w-8 h-8 text-pink-500" />,
        title: "Bättre Hälsa",
        description: "Investera i ditt långsiktiga välmående.",
    },
];


const ResultView: React.FC<ResultViewProps> = ({ data, goalData }) => {
    if (!data.weight || !data.height || !goalData.goalWeight) {
        return null;
    }

    const weightChange = goalData.goalWeight - data.weight;
    const currentFatKg = data.bodyFat || 0;
    const goalFatKg = goalData.goalBodyFat || 0;
    const fatChangeKg = goalFatKg - currentFatKg;
    const muscleChangeKg = (goalData.goalMuscleMass || 0) - (data.muscleMass || 0);
    
    const currentBMI = calculateBMI(data.weight, data.height);
    const goalBMI = calculateBMI(goalData.goalWeight, data.height);
    const bmiChange = goalBMI - currentBMI;

    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold text-gray-700 text-center">Resultat & Motivation</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <ResultCard title="Viktförändring" value={`${formatNumber(weightChange)} kg`} color={weightChange >= 0 ? 'text-red-500' : 'text-green-500'} />
               {data.bodyFat > 0 && goalData.goalBodyFat > 0 ? (
                    <ResultCard title="Fettmassa" value={`${formatNumber(fatChangeKg)} kg`} color={fatChangeKg >= 0 ? 'text-red-500' : 'text-green-500'} />
               ) : null}
               {data.muscleMass > 0 && goalData.goalMuscleMass > 0 ? (
                    <ResultCard title="Muskelmassa" value={`${formatNumber(muscleChangeKg)} kg`} color={muscleChangeKg >= 0 ? 'text-green-500' : 'text-red-500'} />
               ) : null}
               <ResultCard title="BMI-skillnad" value={`${formatNumber(bmiChange)}`} color={bmiChange >= 0 ? 'text-red-500' : 'text-green-500'} />
            </div>

             <div className="pt-6 border-t border-gray-100">
                <p className="text-center text-gray-600 mb-4">Din resa handlar om mer än siffror på vågen. Se fram emot att:</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {benefits.map((benefit) => (
                        <div key={benefit.title} className="bg-gray-50/70 p-4 rounded-lg text-center flex flex-col items-center justify-start h-full">
                            {benefit.icon}
                            <p className="font-semibold text-gray-800 mt-2 text-md">{benefit.title}</p>
                            <p className="text-gray-500 text-xs mt-1">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ResultView;