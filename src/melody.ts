/**
 * Melody extraction from audio data
 */

import { Note, AnalysisParams, defaultAnalysisParams } from "./types";
import { detectPitch, frequencyToNote, frequencyToPitchClass } from "./pitch";

/**
 * Extract melody notes from audio data
 */
export function extractMelody(
  data: Float32Array, 
  sampleRate: number, 
  params: Partial<AnalysisParams> = {}
): { notes: Note[]; pitchClassHistogram: number[] } {
  const opts = { ...defaultAnalysisParams, ...params };
  
  const hopSize = 2048;
  const frameSize = 4096;
  const pitchClassHistogram = new Array(12).fill(0);
  
  const rmsThreshold = 0.01 * (opts.pitchSensitivity / 100);
  const minDuration = opts.minNoteDuration / 1000;
  
  let lastNote = "";
  let noteStartTime = 0;
  const notes: Note[] = [];
  
  for (let i = 0; i < data.length - frameSize; i += hopSize) {
    const frame = data.slice(i, i + frameSize);
    
    // Calculate RMS
    let rms = 0;
    for (let j = 0; j < frame.length; j++) {
      rms += frame[j] * frame[j];
    }
    rms = Math.sqrt(rms / frame.length);
    
    // Skip quiet sections
    if (rms < rmsThreshold) {
      if (lastNote && lastNote !== "rest") {
        const duration = (i / sampleRate) - noteStartTime;
        if (duration > minDuration) {
          notes.push({ 
            note: lastNote, 
            time: noteStartTime,
            duration: duration
          });
        }
        lastNote = "";
      }
      continue;
    }
    
    // Detect pitch
    const pitch = detectPitch(frame, sampleRate);
    const note = frequencyToNote(pitch);
    const pitchClass = frequencyToPitchClass(pitch);
    
    // Update pitch class histogram
    if (pitchClass >= 0) {
      pitchClassHistogram[pitchClass] += rms;
    }
    
    // Track note changes
    if (note !== "rest" && note !== lastNote) {
      if (lastNote && lastNote !== "rest") {
        const duration = (i / sampleRate) - noteStartTime;
        if (duration > minDuration) {
          notes.push({ 
            note: lastNote, 
            time: noteStartTime,
            duration: duration
          });
        }
      }
      lastNote = note;
      noteStartTime = i / sampleRate;
    }
  }
  
  // Add last note
  if (lastNote && lastNote !== "rest") {
    const duration = (data.length / sampleRate) - noteStartTime;
    if (duration > minDuration) {
      notes.push({ 
        note: lastNote, 
        time: noteStartTime,
        duration: duration
      });
    }
  }
  
  // Limit to 64 notes for performance
  return { notes: notes.slice(0, 64), pitchClassHistogram };
}

/**
 * Quantize notes to a grid
 */
export function quantizeNotes(notes: Note[], tempo: number, quantizeValue: string): Note[] {
  if (quantizeValue === "none") return notes;
  
  const beatDuration = 60 / tempo;
  
  const quantizeMap: Record<string, number> = {
    "1/4": 1,
    "1/8": 0.5,
    "1/16": 0.25,
    "1/32": 0.125,
  };
  
  const gridSize = beatDuration * (quantizeMap[quantizeValue] || 0.25);
  
  return notes.map(note => ({
    ...note,
    time: Math.round(note.time / gridSize) * gridSize,
    duration: note.duration ? Math.max(gridSize, Math.round(note.duration / gridSize) * gridSize) : undefined
  }));
}

/**
 * Get note at a specific time
 */
export function getNoteAtTime(notes: Note[], time: number): Note | null {
  for (const note of notes) {
    const noteEnd = note.time + (note.duration || 0);
    if (time >= note.time && time < noteEnd) {
      return note;
    }
  }
  return null;
}

/**
 * Filter notes by octave range
 */
export function filterNotesByOctave(notes: Note[], minOctave: number, maxOctave: number): Note[] {
  return notes.filter(note => {
    const match = note.note.match(/(\d+)$/);
    if (!match) return false;
    const octave = parseInt(match[1]);
    return octave >= minOctave && octave <= maxOctave;
  });
}

/**
 * Calculate note density (notes per second)
 */
export function calculateNoteDensity(notes: Note[], duration: number): number {
  if (duration <= 0) return 0;
  return notes.length / duration;
}
