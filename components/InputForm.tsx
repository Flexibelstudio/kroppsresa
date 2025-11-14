
import React from 'react';
import { type UserData, type GoalData } from '../types';
import { UploadIcon } from './icons';

interface InputFormProps {
  data: UserData;
  goalData: GoalData;
  setData: React.Dispatch<React.SetStateAction<UserData>>;
  setGoalData: React.Dispatch<React.SetStateAction<GoalData>>;
  onImageUpload: (file: File) => void;
  onGenerate: () => void;
  onClear: () => void;
  isGenerating: boolean;
  originalImage: string | null;
}

const InputField: React.FC<{ label: string; unit: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; name: string; }> = ({ label, unit, value, onChange, name }) => {
    const isOptional = label.includes('(frivilligt)');
    const mainLabel = label.replace('(frivilligt)', '').trim();

    return (
        <div className="relative">
            <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-1">
                {mainLabel}
                {isOptional && <span className="text-gray-400 font-normal ml-1">(frivilligt)</span>}
            </label>
            <input
              id={name}
              name={name}
              type="number"
              value={value || ''}
              onChange={onChange}
              className="w-full pl-3 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
              placeholder="0"
            />
            <span className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500">{unit}</span>
        </div>
    );
};

const InputForm: React.FC<InputFormProps> = ({ data, goalData, setData, setGoalData, onImageUpload, onGenerate, onClear, isGenerating, originalImage }) => {
  
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (name === 'gender') {
      setData(prev => ({ ...prev, gender: value }));
    } else if (type === 'radio') {
      setData(prev => ({ ...prev, gender: value }));
    } 
    else {
      setData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    }
  };
  
  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoalData(prev => ({ ...prev, [e.target.name]: parseFloat(e.target.value) || 0 }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Längd" unit="cm" value={data.height} onChange={handleUserChange} name="height" />
          <InputField label="Ålder" unit="år" value={data.age} onChange={handleUserChange} name="age" />
          <InputField label="Vikt" unit="kg" value={data.weight} onChange={handleUserChange} name="weight" />
          <InputField label="Fettmassa (frivilligt)" unit="kg" value={data.bodyFat} onChange={handleUserChange} name="bodyFat" />
          <InputField label="Muskelmassa (frivilligt)" unit="kg" value={data.muscleMass} onChange={handleUserChange} name="muscleMass" />
        </div>
         <div className="mt-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">Kön</label>
          <div className="flex gap-x-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="man"
                checked={data.gender === 'man'}
                onChange={handleUserChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <span className="ml-2 text-gray-700">Man</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="kvinna"
                checked={data.gender === 'kvinna'}
                onChange={handleUserChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <span className="ml-2 text-gray-700">Kvinna</span>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Målvikt" unit="kg" value={goalData.goalWeight} onChange={handleGoalChange} name="goalWeight" />
          <InputField label="Målfettmassa (frivilligt)" unit="kg" value={goalData.goalBodyFat} onChange={handleGoalChange} name="goalBodyFat" />
          <InputField label="Målmuskelmassa (frivilligt)" unit="kg" value={goalData.goalMuscleMass} onChange={handleGoalChange} name="goalMuscleMass" />
        </div>
      </div>

      <div>
        <label htmlFor="image-upload" className="w-full flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
          {originalImage ? (
            <div className="flex items-center gap-4">
              <img src={originalImage} alt="Uppladdad förhandsvisning" className="w-16 h-20 object-cover rounded-lg shadow-sm" />
              <div className="text-left">
                <span className="text-primary font-semibold text-lg">Bild vald!</span>
                <p className="text-sm text-gray-500 mt-1">Klicka för att byta bild.</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <UploadIcon className="w-10 h-10 text-gray-400 mb-2 mx-auto" />
              <span className="text-primary font-semibold">Välj en helkroppsbild</span>
              <p className="text-xs text-gray-500 mt-1">PNG eller JPG</p>
            </div>
          )}
        </label>
        <input id="image-upload" type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleFileChange} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full flex-grow text-white bg-primary hover:bg-primary-dark focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-lg px-8 py-4 text-center transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Genererar...' : 'Generera målbild'}
        </button>
        <button
          onClick={onClear}
          className="w-full sm:w-auto text-gray-500 hover:text-gray-700 font-medium rounded-lg px-6 py-4 text-center transition-colors"
        >
          Rensa data
        </button>
      </div>
    </div>
  );
};

export default InputForm;
