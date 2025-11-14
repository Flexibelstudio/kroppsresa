
export interface UserData {
  height: number;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  gender: string;
  age: number;
}

export interface GoalData {
  goalWeight: number;
  goalBodyFat: number;
  goalMuscleMass: number;
}

export interface StoredData {
  user: UserData;
  goal: GoalData;
  originalImage: string | null;
}