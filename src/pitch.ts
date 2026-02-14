/**
 * Pitch detection using autocorrelation algorithm
 */

import { PitchDetectionOptions } from "./types";

const NOTE_NAMES = ["c", "cs", "d", "ds", "e", "f", "fs", "g", "gs", "a", "as", "b"];

/**
 * Detect pitch from an audio frame using autocorrelation
 */
export function detectPitch(frame: Float32Array, sampleRate: number, options: PitchDetectionOptions = {}): number {
  const minFreq = options.minFreq ?? 80;
  const maxFreq = options.maxFreq ?? 1000;
  
  const minPeriod = Math.floor(sampleRate / maxFreq);
  const maxPeriod = Math.floor(sampleRate / minFreq);
  
  let maxCorr = 0;
  let bestPeriod = 0;
  
  for (let period = minPeriod; period < maxPeriod; period++) {
    let corr = 0;
    for (let i = 0; i < frame.length - period; i++) {
      corr += frame[i] * frame[i + period];
    }
    if (corr > maxCorr) {
      maxCorr = corr;
      bestPeriod = period;
    }
  }
  
  return bestPeriod > 0 ? sampleRate / bestPeriod : 0;
}

/**
 * Convert frequency to note name
 */
export function frequencyToNote(freq: number): string {
  const a4 = 440;
  const c0 = a4 * Math.pow(2, -4.75);
  
  if (freq < 50) return "rest";
  
  const halfSteps = 12 * Math.log2(freq / c0);
  const octave = Math.floor(halfSteps / 12);
  const note = Math.round(halfSteps % 12);
  
  const clampedNote = ((note % 12) + 12) % 12;
  return `${NOTE_NAMES[clampedNote]}${octave}`;
}

/**
 * Convert frequency to pitch class (0-11)
 */
export function frequencyToPitchClass(freq: number): number {
  if (freq < 50) return -1;
  const a4 = 440;
  const c0 = a4 * Math.pow(2, -4.75);
  const halfSteps = 12 * Math.log2(freq / c0);
  return ((Math.round(halfSteps) % 12) + 12) % 12;
}

/**
 * Convert note name to frequency
 */
export function noteToFrequency(note: string): number {
  const match = note.match(/^([a-gs]+)(\d+)$/);
  if (!match) return 0;
  
  const [, noteName, octaveStr] = match;
  const octave = parseInt(octaveStr);
  const noteIndex = NOTE_NAMES.indexOf(noteName);
  
  if (noteIndex === -1) return 0;
  
  const a4 = 440;
  const halfSteps = (octave - 4) * 12 + noteIndex - 9;
  return a4 * Math.pow(2, halfSteps / 12);
}

/**
 * Transpose a note by semitones
 */
export function transposeNote(note: string, semitones: number): string {
  const match = note.match(/^([a-gs]+)(\d+)$/);
  if (!match) return note;
  
  const [, noteName, octaveStr] = match;
  const octave = parseInt(octaveStr);
  const noteIndex = NOTE_NAMES.indexOf(noteName);
  if (noteIndex === -1) return note;
  
  const newIndex = noteIndex + semitones;
  const newNoteIndex = ((newIndex % 12) + 12) % 12;
  const octaveChange = Math.floor(newIndex / 12);
  
  return `${NOTE_NAMES[newNoteIndex]}${octave + octaveChange}`;
}

/**
 * Format note for Strudel notation
 */
export function formatNoteForStrudel(note: string): string {
  const match = note.match(/^([A-Ga-g])([#b]?)(\d+)$/);
  if (!match) return note.toLowerCase();
  
  const [, noteName, accidental, octave] = match;
  const strudelAccidental = accidental === '#' ? 's' : accidental === 'b' ? 'f' : '';
  return `${noteName.toLowerCase()}${strudelAccidental}${octave}`;
}
