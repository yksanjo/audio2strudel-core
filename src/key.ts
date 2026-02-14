/**
 * Key detection using Krumhansl-Schmuckler algorithm
 */

import { KeyDetectionResult } from "./types";

// Krumhansl-Schmuckler key profiles
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/**
 * Detect key from pitch class histogram
 */
export function detectKey(pitchClassHistogram: number[]): string {
  let bestKey = "C";
  let bestCorr = -Infinity;
  
  const normalize = (arr: number[]): number[] => {
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum > 0 ? arr.map(v => v / sum) : arr;
  };
  
  const normalizedHist = normalize(pitchClassHistogram);
  
  for (let shift = 0; shift < 12; shift++) {
    const shiftedMajor = MAJOR_PROFILE.map((_, i) => MAJOR_PROFILE[(i + shift) % 12]);
    const shiftedMinor = MINOR_PROFILE.map((_, i) => MINOR_PROFILE[(i + shift) % 12]);
    
    const normalizedMajor = normalize(shiftedMajor);
    const normalizedMinor = normalize(shiftedMinor);
    
    let majorCorr = 0;
    let minorCorr = 0;
    
    for (let i = 0; i < 12; i++) {
      majorCorr += normalizedHist[i] * normalizedMajor[i];
      minorCorr += normalizedHist[i] * normalizedMinor[i];
    }
    
    if (majorCorr > bestCorr) {
      bestCorr = majorCorr;
      bestKey = NOTE_NAMES[shift];
    }
    if (minorCorr > bestCorr) {
      bestCorr = minorCorr;
      bestKey = NOTE_NAMES[shift] + "m";
    }
  }
  
  return bestKey;
}

/**
 * Detect key with detailed result
 */
export function detectKeyDetailed(pitchClassHistogram: number[]): KeyDetectionResult {
  let bestKey = "C";
  let bestCorr = -Infinity;
  let mode: "major" | "minor" = "major";
  
  const normalize = (arr: number[]): number[] => {
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum > 0 ? arr.map(v => v / sum) : arr;
  };
  
  const normalizedHist = normalize(pitchClassHistogram);
  
  for (let shift = 0; shift < 12; shift++) {
    const shiftedMajor = MAJOR_PROFILE.map((_, i) => MAJOR_PROFILE[(i + shift) % 12]);
    const shiftedMinor = MINOR_PROFILE.map((_, i) => MINOR_PROFILE[(i + shift) % 12]);
    
    const normalizedMajor = normalize(shiftedMajor);
    const normalizedMinor = normalize(shiftedMinor);
    
    let majorCorr = 0;
    let minorCorr = 0;
    
    for (let i = 0; i < 12; i++) {
      majorCorr += normalizedHist[i] * normalizedMajor[i];
      minorCorr += normalizedHist[i] * normalizedMinor[i];
    }
    
    if (majorCorr > bestCorr) {
      bestCorr = majorCorr;
      bestKey = NOTE_NAMES[shift];
      mode = "major";
    }
    if (minorCorr > bestCorr) {
      bestCorr = minorCorr;
      bestKey = NOTE_NAMES[shift] + "m";
      mode = "minor";
    }
  }
  
  return {
    key: bestKey,
    mode,
    confidence: Math.max(0, bestCorr),
  };
}

/**
 * Get semitone distance between two keys
 */
export function getKeyTransposition(fromKey: string, toKey: string): number {
  const noteToSemitone: Record<string, number> = {
    "C": 0, "C#": 1, "C#/Db": 1, "Db": 1, 
    "D": 2, "D#": 3, "D#/Eb": 3, "Eb": 3,
    "E": 4, 
    "F": 5, "F#": 6, "F#/Gb": 6, "Gb": 6,
    "G": 7, "G#": 8, "G#/Ab": 8, "Ab": 8,
    "A": 9, "A#": 10, "A#/Bb": 10, "Bb": 10,
    "B": 11
  };
  
  const fromRoot = fromKey.replace("m", "").replace("/Db", "").replace("/Eb", "").replace("/Gb", "").replace("/Ab", "").replace("/Bb", "");
  const toRoot = toKey.replace("m", "").replace("/Db", "").replace("/Eb", "").replace("/Gb", "").replace("/Ab", "").replace("/Bb", "");
  
  const fromSemi = noteToSemitone[fromRoot] ?? 0;
  const toSemi = noteToSemitone[toRoot] ?? 0;
  
  return toSemi - fromSemi;
}

/**
 * Get chord name in a different key
 */
export function getChordNameInKey(baseName: string, semitones: number): string {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  
  const match = baseName.match(/^([A-G]#?)(.*)$/);
  if (!match) return baseName;
  
  const [, root, suffix] = match;
  const rootIndex = noteNames.indexOf(root);
  if (rootIndex === -1) return baseName;
  
  const newIndex = ((rootIndex + semitones) % 12 + 12) % 12;
  return `${noteNames[newIndex]}${suffix}`;
}
