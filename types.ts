export enum BrewPhase {
  Mashing = 'Mashing',
  Sparging = 'Sparging',
  Boiling = 'Boiling',
  Chilling = 'Chilling',
  Fermentation = 'Fermentation',
  Secondary = 'Secondary',
  Bottling = 'Bottling',
  Completed = 'Completed'
}

export interface LogEntry {
  timestamp: string;
  note: string;
}

export interface PhaseData {
  startTime?: string;
  endTime?: string;
  temperature?: string; 
  initialTemperature?: string;
  finalTemperature?: string;
  tempUnit?: 'C' | 'F';
  gravity?: string;
  preBoilGravity?: string;
  postBoilGravity?: string;
  preBoilVolume?: string;
  postBoilVolume?: string;
  notes: string;
  // Water Tracking
  waterBottlesCount?: number;
  bottleVolume?: string;
}

export interface BrewSession {
  id: string;
  name: string;
  style: string;
  createdAt: string;
  currentPhase: BrewPhase;
  data: Partial<Record<BrewPhase, PhaseData>>;
  // Timer persistence
  timerEndTime?: number; // timestamp
  timerRemainingSeconds?: number; // for paused state
  timerDurationMinutes?: number;
  timerIsRunning?: boolean;
}

export interface AIResponse {
  text: string;
}