# audio2strudel-core

Pure TypeScript library for audio analysis - pitch detection, key detection, tempo estimation, and Strudel code generation.

## Features

- **Pitch Detection**: Autocorrelation-based algorithm for accurate melody extraction
- **Key Detection**: Krumhansl-Schmuckler algorithm for harmonic key detection  
- **Tempo Estimation**: Energy-based beat tracking for BPM detection
- **Melody Extraction**: Continuous pitch tracking with note segmentation
- **Chord Generation**: Harmonic analysis with chord progression generation
- **Strudel Code Generation**: Ready-to-use Strudel live coding patterns

## Installation

```bash
npm install audio2strudel-core
```

## Usage

```typescript
import { analyzeAudio } from 'audio2strudel-core';

// Analyze audio from Float32Array (e.g., from Web Audio API)
const result = analyzeAudio(audioData, sampleRate, {
  pitchSensitivity: 50,
  autoDetectTempo: true,
  autoDetectKey: true,
  quantizeNotes: true,
  quantizeValue: '1/16',
});

console.log(result.strudelCode.combined);
// Output: stack(
//   note("c4 e4 g4 e4").sound("piano"),
//   note("[c4,e4,g4] [d4,f4,a4]").sound("piano")
// ).cpm(30)
```

## API

### Core Functions

- `analyzeAudio(data, sampleRate, params)` - Full audio analysis pipeline
- `detectPitch(frame, sampleRate)` - Detect pitch from audio frame
- `detectTempo(data, sampleRate)` - Detect BPM from audio data
- `detectKey(pitchClassHistogram)` - Detect musical key
- `extractMelody(data, sampleRate, params)` - Extract melody notes
- `extractChords(data, sampleRate, duration, key)` - Extract chord progression
- `generateStrudelCode(melody, chords, tempo, timeSignature)` - Generate Strudel patterns

### Types

```typescript
interface Note {
  note: string;    // e.g., "c4", "e5"
  time: number;   // Start time in seconds
  duration?: number; // Duration in seconds
}

interface Chord {
  notes: string[];  // e.g., ["c3", "e3", "g3"]
  name: string;     // e.g., "C", "Dm"
  time: number;
  duration?: number;
  degree?: string;  // e.g., "I", "ii"
}
```

## Examples

### Pitch Detection

```typescript
import { detectPitch, frequencyToNote } from 'audio2strudel-core';

const pitch = detectPitch(audioFrame, 44100);
const noteName = frequencyToNote(pitch); // "c4"
```

### Tempo Detection

```typescript
import { detectTempo } from 'audio2strudel-core';

const bpm = detectTempo(audioData, 44100); // 120
```

### Strudel Code Generation

```typescript
import { generateStrudelCode } from 'audio2strudel-core';

const code = generateStrudelCode(
  [{ note: 'c4', time: 0, duration: 0.5 }],
  [{ notes: ['c3', 'e3', 'g3'], name: 'C', time: 0, duration: 2 }],
  120,
  '4/4'
);
```

## Browser Support

Works in browsers via Web Audio API:

```javascript
const audioContext = new AudioContext();
const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
const channelData = audioBuffer.getChannelData(0);

const result = analyzeAudio(channelData, audioBuffer.sampleRate);
```

## License

MIT
