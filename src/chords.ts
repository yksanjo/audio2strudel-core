/**
 * Chord extraction and generation
 */

import { Chord, Note } from "./types";
import { transposeNote } from "./pitch";
import { getKeyTransposition, getChordNameInKey } from "./key";

/**
 * Extract chords based on detected key
 */
export function extractChords(
  data: Float32Array, 
  sampleRate: number, 
  duration: number, 
  detectedKey: string
): Chord[] {
  const chords: Chord[] = [];
  
  const isMinor = detectedKey.includes("m") && !detectedKey.includes("maj");
  
  // Chord templates in C major / A minor
  const majorChordTemplates = [
    { notes: ["c3", "e3", "g3"], name: "C", degree: "I" },
    { notes: ["d3", "f3", "a3"], name: "Dm", degree: "ii" },
    { notes: ["e3", "g3", "b3"], name: "Em", degree: "iii" },
    { notes: ["f3", "a3", "c4"], name: "F", degree: "IV" },
    { notes: ["g3", "b3", "d4"], name: "G", degree: "V" },
    { notes: ["a3", "c4", "e4"], name: "Am", degree: "vi" },
  ];
  
  const minorChordTemplates = [
    { notes: ["a2", "c3", "e3"], name: "Am", degree: "i" },
    { notes: ["b2", "d3", "f3"], name: "Bdim", degree: "ii°" },
    { notes: ["c3", "e3", "g3"], name: "C", degree: "III" },
    { notes: ["d3", "f3", "a3"], name: "Dm", degree: "iv" },
    { notes: ["e3", "g3", "b3"], name: "Em", degree: "v" },
    { notes: ["f3", "a3", "c4"], name: "F", degree: "VI" },
    { notes: ["g3", "b3", "d4"], name: "G", degree: "VII" },
  ];
  
  const baseKey = isMinor ? "Am" : "C";
  const transposition = getKeyTransposition(baseKey, detectedKey);
  const templates = isMinor ? minorChordTemplates : majorChordTemplates;
  
  // Transpose chords to detected key
  const transposedChords = templates.map(chord => ({
    notes: chord.notes.map(n => transposeNote(n, transposition)),
    name: getChordNameInKey(chord.name, transposition),
    degree: chord.degree
  }));
  
  // Generate chord progression based on energy
  const segmentDuration = 2;
  const numSegments = Math.min(8, Math.floor(duration / segmentDuration));
  const samplesPerSegment = Math.floor(data.length / Math.max(1, numSegments));
  
  for (let i = 0; i < numSegments; i++) {
    const startSample = i * samplesPerSegment;
    const segment = data.slice(startSample, startSample + samplesPerSegment);
    
    // Calculate energy
    let energy = 0;
    for (let j = 0; j < segment.length; j++) {
      energy += Math.abs(segment[j]);
    }
    
    // Select chord based on energy pattern
    const chordIndex = Math.floor((energy * 1000) % transposedChords.length);
    const chord = transposedChords[chordIndex];
    
    chords.push({
      notes: chord.notes,
      name: chord.name,
      time: i * segmentDuration,
      duration: segmentDuration,
      degree: chord.degree
    });
  }
  
  return chords;
}

/**
 * Generate chords from notes
 */
export function generateChordsFromNotes(notes: Note[], timeSignature: string = "4/4"): Chord[] {
  if (notes.length === 0) return [];
  
  const [beatsPerBar] = timeSignature.split("/").map(Number);
  const chordDuration = beatsPerBar * 0.5; // Assume quarter note = 0.5 seconds at 120 BPM
  
  const chords: Chord[] = [];
  const chordMap = new Map<number, string[]>();
  
  // Group notes by time window
  for (const note of notes) {
    const chordTime = Math.floor(note.time / chordDuration) * chordDuration;
    if (!chordMap.has(chordTime)) {
      chordMap.set(chordTime, []);
    }
    chordMap.get(chordTime)!.push(note.note);
  }
  
  // Convert to chords
  for (const [time, notesAtTime] of chordMap) {
    const uniqueNotes = [...new Set(notesAtTime)];
    chords.push({
      notes: uniqueNotes.slice(0, 4), // Max 4 notes per chord
      name: uniqueNotes[0]?.replace(/\d+$/, "") || "C",
      time,
      duration: chordDuration
    });
  }
  
  return chords.sort((a, b) => a.time - b.time);
}

/**
 * Simplify chord progression
 */
export function simplifyChordProgression(chords: Chord[]): Chord[] {
  if (chords.length <= 1) return chords;
  
  const simplified: Chord[] = [chords[0]];
  
  for (let i = 1; i < chords.length; i++) {
    const prev = simplified[simplified.length - 1];
    const current = chords[i];
    
    // Only add if chord name changes
    if (current.name !== prev.name) {
      simplified.push(current);
    }
  }
  
  return simplified;
}

/**
 * Get chord at a specific time
 */
export function getChordAtTime(chords: Chord[], time: number): Chord | null {
  for (const chord of chords) {
    const chordEnd = chord.time + (chord.duration || 0);
    if (time >= chord.time && time < chordEnd) {
      return chord;
    }
  }
  return null;
}

/**
 * Get roman numeral notation for chord
 */
export function getRomanNumeral(chord: Chord, key: string): string {
  if (!chord.degree) return chord.name;
  
  const isMinor = key.includes("m");
  const romanMap: Record<string, string> = isMinor ? {
    "i": "i", "ii°": "ii°", "III": "III", "iv": "iv", "v": "v", "VI": "VI", "VII": "VII"
  } : {
    "I": "I", "ii": "ii", "iii": "iii", "IV": "IV", "V": "V", "vi": "vi"
  };
  
  return romanMap[chord.degree] || chord.name;
}
