/**
 * Strudel code generation
 */

import { Note, Chord } from "./types";
import { formatNoteForStrudel } from "./pitch";

export interface StrudelCode {
  melody: string;
  chords: string;
  combined: string;
}

/**
 * Generate Strudel code from melody and chords
 */
export function generateStrudelCode(
  melody: Note[], 
  chords: Chord[], 
  tempo: number, 
  timeSignature: string
): StrudelCode {
  const [beatsPerBar, noteValue] = timeSignature.split("/").map(Number);
  const beatDuration = (60 / tempo) * (4 / noteValue);
  
  // Generate melody with duration notation
  const melodyWithDuration = melody.map(note => {
    const formatted = formatNoteForStrudel(note.note);
    if (!note.duration) return formatted;
    
    const durationBeats = note.duration / beatDuration;
    if (Math.abs(durationBeats - 0.5) < 0.1) return `${formatted}*0.5`;
    if (Math.abs(durationBeats - 1) < 0.1) return formatted;
    if (Math.abs(durationBeats - 2) < 0.1) return `${formatted}*2`;
    if (Math.abs(durationBeats - 4) < 0.1) return `${formatted}*4`;
    
    return formatted;
  }).join(" ");
  
  const melodyStrudel = melody.length > 0 
    ? `note("${melodyWithDuration}").sound("piano")`
    : `note("~").sound("piano")`;
  
  // Generate chords with timing
  const chordWithDuration = chords.map(chord => {
    const chordNotes = chord.notes.map(n => formatNoteForStrudel(n)).join(",");
    const formatted = `[${chordNotes}]`;
    if (!chord.duration) return formatted;
    
    const durationBeats = chord.duration / beatDuration;
    if (Math.abs(durationBeats - 0.5) < 0.1) return `${formatted}*0.5`;
    if (Math.abs(durationBeats - 1) < 0.1) return formatted;
    if (Math.abs(durationBeats - 2) < 0.1) return `${formatted}*2`;
    if (Math.abs(durationBeats - 4) < 0.1) return `${formatted}*4`;
    
    return formatted;
  }).join(" ");
  
  const chordStrudel = chords.length > 0
    ? `note("${chordWithDuration}").sound("piano")`
    : `note("~").sound("piano")`;
  
  const combined = `// Tempo: ${tempo} BPM, Time Signature: ${timeSignature}
// Melody: ${melody.length} notes, Chords: ${chords.length} chords
stack(
  ${melodyStrudel},
  ${chordStrudel}
).cpm(${Math.round(tempo / 4)})`;

  return {
    melody: melodyStrudel,
    chords: chordStrudel,
    combined
  };
}

/**
 * Generate melody-only Strudel code
 */
export function generateMelodyCode(melody: Note[], tempo: number, timeSignature: string): string {
  const [_, noteValue] = timeSignature.split("/").map(Number);
  const beatDuration = (60 / tempo) * (4 / noteValue);
  
  const melodyWithDuration = melody.map(note => {
    const formatted = formatNoteForStrudel(note.note);
    if (!note.duration) return formatted;
    
    const durationBeats = note.duration / beatDuration;
    if (Math.abs(durationBeats - 0.5) < 0.1) return `${formatted}*0.5`;
    if (Math.abs(durationBeats - 1) < 0.1) return formatted;
    if (Math.abs(durationBeats - 2) < 0.1) return `${formatted}*2`;
    if (Math.abs(durationBeats - 4) < 0.1) return `${formatted}*4`;
    
    return formatted;
  }).join(" ");
  
  return melody.length > 0 
    ? `note("${melodyWithDuration}").sound("piano")`
    : `note("~").sound("piano")`;
}

/**
 * Generate chord-only Strudel code
 */
export function generateChordCode(chords: Chord[], tempo: number, timeSignature: string): string {
  const [_, noteValue] = timeSignature.split("/").map(Number);
  const beatDuration = (60 / tempo) * (4 / noteValue);
  
  const chordWithDuration = chords.map(chord => {
    const chordNotes = chord.notes.map(n => formatNoteForStrudel(n)).join(",");
    const formatted = `[${chordNotes}]`;
    if (!chord.duration) return formatted;
    
    const durationBeats = chord.duration / beatDuration;
    if (Math.abs(durationBeats - 0.5) < 0.1) return `${formatted}*0.5`;
    if (Math.abs(durationBeats - 1) < 0.1) return formatted;
    if (Math.abs(durationBeats - 2) < 0.1) return `${formatted}*2`;
    if (Math.abs(durationBeats - 4) < 0.1) return `${formatted}*4`;
    
    return formatted;
  }).join(" ");
  
  return chords.length > 0
    ? `note("${chordWithDuration}").sound("piano")`
    : `note("~").sound("piano")`;
}

/**
 * Generate mini notation pattern (simplified)
 */
export function generateMiniPattern(notes: Note[]): string {
  if (notes.length === 0) return "~";
  
  return notes.map(note => formatNoteForStrudel(note.note)).join(" ");
}
