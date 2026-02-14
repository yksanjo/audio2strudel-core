/**
 * audio2strudel-core
 * Pure audio analysis library for pitch detection, key detection, and tempo estimation
 */

// Types
export * from "./types";

// Pitch detection
export * from "./pitch";

// Tempo detection
export * from "./tempo";

// Key detection
export * from "./key";

// Melody extraction
export * from "./melody";

// Chord extraction
export * from "./chords";

// Strudel code generation
export * from "./strudel";

/**
 * Full audio analysis pipeline
 */
import { Note, Chord, AnalysisParams, defaultAnalysisParams } from "./types";
import { detectPitch, frequencyToNote, frequencyToPitchClass } from "./pitch";
import { detectTempo } from "./tempo";
import { detectKey } from "./key";
import { extractMelody, quantizeNotes } from "./melody";
import { extractChords } from "./chords";
import { generateStrudelCode, StrudelCode } from "./strudel";

export interface FullAnalysisResult {
  melody: Note[];
  chords: Chord[];
  strudelCode: StrudelCode;
  detectedKey: string;
  estimatedTempo: number;
  duration: number;
  sampleRate: number;
}

/**
 * Analyze audio data and return complete analysis result
 */
export function analyzeAudio(
  data: Float32Array,
  sampleRate: number,
  params: Partial<AnalysisParams> = {}
): FullAnalysisResult {
  const opts = { ...defaultAnalysisParams, ...params };
  const duration = data.length / sampleRate;
  
  // Detect tempo
  let estimatedTempo = opts.autoDetectTempo 
    ? detectTempo(data, sampleRate)
    : opts.targetTempo;
  
  // Extract melody
  const { notes: rawMelody, pitchClassHistogram } = extractMelody(data, sampleRate, opts);
  
  // Detect key
  let detectedKey = opts.autoDetectKey 
    ? detectKey(pitchClassHistogram)
    : opts.targetKey;
  
  // Quantize notes
  let melody = rawMelody;
  if (opts.quantizeNotes) {
    melody = quantizeNotes(rawMelody, estimatedTempo, opts.quantizeValue);
  }
  
  // Extract chords
  const chords = extractChords(data, sampleRate, duration, detectedKey);
  
  // Generate Strudel code
  const strudelCode = generateStrudelCode(melody, chords, estimatedTempo, opts.timeSignature);
  
  return {
    melody,
    chords,
    strudelCode,
    detectedKey,
    estimatedTempo,
    duration,
    sampleRate,
  };
}

export default {
  analyzeAudio,
  detectPitch,
  detectTempo,
  detectKey,
  extractMelody,
  extractChords,
  generateStrudelCode,
};
