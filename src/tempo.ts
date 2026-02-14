/**
 * Tempo detection using onset strength analysis
 */

import { TempoDetectionOptions } from "./types";

/**
 * Detect tempo from audio data using onset strength
 */
export function detectTempo(data: Float32Array, sampleRate: number, options: TempoDetectionOptions = {}): number {
  const minBpm = options.minBpm ?? 60;
  const maxBpm = options.maxBpm ?? 200;
  
  const frameSize = 1024;
  const hopSize = 512;
  const energies: number[] = [];
  
  // Calculate energy envelope
  for (let i = 0; i < data.length - frameSize; i += hopSize) {
    let energy = 0;
    for (let j = 0; j < frameSize; j++) {
      energy += data[i + j] * data[i + j];
    }
    energies.push(Math.sqrt(energy / frameSize));
  }
  
  // Calculate onset strength
  const onsetStrength: number[] = [];
  for (let i = 1; i < energies.length; i++) {
    const diff = energies[i] - energies[i - 1];
    onsetStrength.push(Math.max(0, diff));
  }
  
  const framesPerSecond = sampleRate / hopSize;
  
  let bestBpm = 120;
  let bestScore = 0;
  
  // Search for best BPM
  for (let bpm = minBpm; bpm <= maxBpm; bpm++) {
    const beatInterval = (60 / bpm) * framesPerSecond;
    let score = 0;
    
    for (let offset = 0; offset < beatInterval; offset++) {
      let tempScore = 0;
      for (let beat = offset; beat < onsetStrength.length; beat += beatInterval) {
        const index = Math.floor(beat);
        if (index < onsetStrength.length) {
          tempScore += onsetStrength[index];
        }
      }
      score = Math.max(score, tempScore);
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestBpm = bpm;
    }
  }
  
  return bestBpm;
}

/**
 * Calculate average interval between onsets
 */
export function calculateAverageInterval(onsets: number[]): number {
  if (onsets.length < 2) return 0;
  
  const intervals: number[] = [];
  for (let i = 1; i < onsets.length; i++) {
    intervals.push(onsets[i] - onsets[i - 1]);
  }
  
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  
  // Convert to BPM
  let bpm = 60 / avgInterval;
  
  // Normalize to typical range
  while (bpm < 60) bpm *= 2;
  while (bpm > 200) bpm /= 2;
  
  return Math.round(bpm);
}

/**
 * Quantize tempo to nearest common value
 */
export function quantizeTempo(tempo: number): number {
  const commonTempos = [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];
  
  let closest = commonTempos[0];
  let minDiff = Math.abs(tempo - closest);
  
  for (const t of commonTempos) {
    const diff = Math.abs(tempo - t);
    if (diff < minDiff) {
      minDiff = diff;
      closest = t;
    }
  }
  
  return closest;
}
