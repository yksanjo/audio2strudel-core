/**
 * Core types for audio2strudel-core
 */

export interface Note {
  note: string;
  time: number;
  duration?: number;
}

export interface Chord {
  notes: string[];
  name: string;
  time: number;
  duration?: number;
  degree?: string;
}

export interface AnalysisResult {
  notes: Note[];
  chords: Chord[];
  detectedKey: string;
  estimatedTempo: number;
  duration: number;
  sampleRate: number;
}

export interface AnalysisParams {
  pitchSensitivity: number;
  amplitudeThreshold: number;
  minNoteDuration: number;
  quantizeNotes: boolean;
  quantizeValue: string;
  autoDetectTempo: boolean;
  targetTempo: number;
  autoDetectKey: boolean;
  targetKey: string;
  timeSignature: string;
}

export const defaultAnalysisParams: AnalysisParams = {
  pitchSensitivity: 50,
  amplitudeThreshold: 0.01,
  minNoteDuration: 100,
  quantizeNotes: true,
  quantizeValue: "1/16",
  autoDetectTempo: true,
  targetTempo: 120,
  autoDetectKey: true,
  targetKey: "C",
  timeSignature: "4/4",
};

export interface PitchDetectionOptions {
  minFreq?: number;
  maxFreq?: number;
}

export interface TempoDetectionOptions {
  minBpm?: number;
  maxBpm?: number;
}

export interface KeyDetectionResult {
  key: string;
  mode: "major" | "minor";
  confidence: number;
}
