
import React from 'react';
import { type UserData, type GoalData } from '../types';

interface GoalTimelineProps {
  data: UserData;
  goalData: GoalData;
}

const GoalTimeline: React.FC<GoalTimelineProps> = ({ data, goalData }) => {
    if (!data.weight || !goalData.goalWeight) {
        return null;
    }

    const calculateTimeframe = (): { minWeeks: number, maxWeeks: number } => {
        const { bodyFat, muscleMass, weight } = data;
        const { goalBodyFat, goalMuscleMass, goalWeight } = goalData;
        
        const fatChangeKg = (bodyFat || 0) - (goalBodyFat || 0);
        const muscleChangeKg = (goalMuscleMass || 0) - (muscleMass || 0);

        const hasBodyCompositionGoals = fatChangeKg > 0 || muscleChangeKg > 0;
        
        if (hasBodyCompositionGoals) {
            const BASE_FAT_LOSS_RATES = { min: 0.4, max: 0.8 }; 
            const BASE_MUSCLE_GAIN_RATES = { min: 0.1, max: 0.25 };
            
            const frequencyFactor = 1;

            const adjustedFatLoss = {
                min: BASE_FAT_LOSS_RATES.min * frequencyFactor,
                max: BASE_FAT_LOSS_RATES.max * frequencyFactor,
            };
            const adjustedMuscleGain = {
                min: BASE_MUSCLE_GAIN_RATES.min * frequencyFactor,
                max: BASE_MUSCLE_GAIN_RATES.max * frequencyFactor,
            };
            
            let weeksForFat: number[] = [0, 0];
            if (fatChangeKg > 0 && adjustedFatLoss.min > 0) {
                weeksForFat = [fatChangeKg / adjustedFatLoss.max, fatChangeKg / adjustedFatLoss.min];
            }
            let weeksForMuscle: number[] = [0, 0];
            if (muscleChangeKg > 0 && adjustedMuscleGain.min > 0) {
                weeksForMuscle = [muscleChangeKg / adjustedMuscleGain.max, muscleChangeKg / adjustedMuscleGain.min];
            }
            const minWeeks = Math.max(weeksForFat[0], weeksForMuscle[0]);
            const maxWeeks = Math.max(weeksForFat[1], weeksForMuscle[1]);
            
            if (minWeeks > 0 || maxWeeks > 0) {
                return { minWeeks: Math.round(minWeeks), maxWeeks: Math.round(maxWeeks) };
            }
        }

        const weightChangeKg = weight - goalWeight;
        if (weightChangeKg > 0) { // Weight loss
            const minRate = 0.5;
            const maxRate = Math.min(1.0, weight * 0.01);
            const minWeeks = weightChangeKg / maxRate;
            const maxWeeks = weightChangeKg / minRate;
            return { minWeeks: Math.round(minWeeks), maxWeeks: Math.round(maxWeeks) };
        } else if (weightChangeKg < 0) { // Weight gain
            const weightToGain = -weightChangeKg;
            const minRate = 0.2;
            const maxRate = 0.4;
            const minWeeks = weightToGain / maxRate;
            const maxWeeks = weightToGain / minRate;
            return { minWeeks: Math.round(minWeeks), maxWeeks: Math.round(maxWeeks) };
        }
        
        return { minWeeks: 4, maxWeeks: 8 };
    };

    const { minWeeks, maxWeeks } = calculateTimeframe();
    const minMonths = Math.max(1, Math.round(minWeeks / 4.33));
    const maxMonths = Math.max(1, Math.round(maxWeeks / 4.33));
    const monthString = minMonths === maxMonths ? `${maxMonths} månader` : `${minMonths}–${maxMonths} månader`;
    
    return (
        <div className="space-y-6 text-center pt-6 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-700">Din tidsplan till målet</h3>

            <div className="w-full max-w-sm mx-auto">
                <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-teal-100">
                        <div style={{ width: '100%' }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
                    </div>
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-600 mt-2">
                    <span>Start</span>
                    <span>Mål</span>
                </div>
            </div>
            
            <p className="text-lg text-gray-700 max-w-xl mx-auto">
                Med rätt plan och stöd kan du nå ditt mål på cirka <strong className="text-gray-800">{monthString}</strong>. Små steg varje vecka skapar stora förändringar.
            </p>
            
            <div className="mt-6 max-w-xl mx-auto p-4 bg-teal-50/70 rounded-lg">
                 <p className="text-gray-800">
                    På <strong className="font-semibold">Flexibel Hälsostudio</strong> får du personlig hjälp med träning, kost och balans – så att din resa blir hållbar och motiverande.
                </p>
            </div>
        </div>
    );
};

export default GoalTimeline;
