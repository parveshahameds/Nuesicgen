
// Music generation and MIDI utilities

export interface GenerationParams {
  genre: string;
  creativity: number;
  tempo: number;
  key: string;
  duration: number;
}

export interface Note {
  pitch: number;
  duration: number;
  velocity: number;
  time: number;
}

export interface Melody {
  notes: Note[];
  tempo: number;
  key: string;
  genre: string;
}

// Simulate neural network music generation
export const generateMelody = async (params: GenerationParams): Promise<Melody> => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

  const { genre, creativity, tempo, key, duration } = params;
  
  // Generate notes based on parameters
  const notes: Note[] = [];
  const noteCount = duration * 4; // 4 notes per bar on average
  
  // Define scale patterns based on key
  const scalePatterns: { [key: string]: number[] } = {
    'C': [60, 62, 64, 65, 67, 69, 71, 72], // C major scale
    'G': [67, 69, 71, 72, 74, 76, 78, 79], // G major scale
    'D': [62, 64, 66, 67, 69, 71, 73, 74], // D major scale
    'A': [69, 71, 73, 74, 76, 78, 80, 81], // A major scale
    'Am': [69, 71, 72, 74, 76, 77, 79, 81], // A minor scale
    'Em': [64, 66, 67, 69, 71, 72, 74, 76], // E minor scale
    'Dm': [62, 64, 65, 67, 69, 70, 72, 74], // D minor scale
  };

  const scale = scalePatterns[key] || scalePatterns['C'];
  
  // Genre-specific generation patterns
  const genreSettings: { [genre: string]: any } = {
    classical: { jumpRange: 3, rhythmVariety: 0.3 },
    jazz: { jumpRange: 5, rhythmVariety: 0.7 },
    electronic: { jumpRange: 6, rhythmVariety: 0.8 },
    ambient: { jumpRange: 2, rhythmVariety: 0.2 },
    minimalist: { jumpRange: 1, rhythmVariety: 0.1 },
    baroque: { jumpRange: 4, rhythmVariety: 0.4 },
  };

  const settings = genreSettings[genre] || genreSettings.classical;
  
  let currentTime = 0;
  let lastPitch = scale[Math.floor(scale.length / 2)]; // Start in middle of scale

  for (let i = 0; i < noteCount; i++) {
    // Use creativity to determine note variation
    const pitchVariation = Math.floor((Math.random() - 0.5) * 2 * settings.jumpRange * creativity);
    let scaleIndex = scale.indexOf(lastPitch);
    
    if (scaleIndex === -1) scaleIndex = 0;
    
    scaleIndex = Math.max(0, Math.min(scale.length - 1, scaleIndex + pitchVariation));
    const pitch = scale[scaleIndex] + (Math.random() > 0.8 ? 12 : 0); // Occasional octave jump
    
    // Rhythm based on genre and creativity
    const baseDuration = 0.25; // Quarter note
    const rhythmFactor = 1 + (Math.random() - 0.5) * settings.rhythmVariety * creativity;
    const duration = Math.max(0.125, baseDuration * rhythmFactor);
    
    // Velocity variation
    const velocity = 60 + Math.random() * 40 * creativity;
    
    notes.push({
      pitch,
      duration,
      velocity: Math.floor(velocity),
      time: currentTime
    });
    
    currentTime += duration;
    lastPitch = pitch;
  }

  return {
    notes,
    tempo,
    key,
    genre
  };
};

// Convert melody to audio for playback
export const playMIDI = (melody: Melody, audioElement: HTMLAudioElement | null) => {
  if (!audioElement) return;

  // Create a simple audio context for Web Audio API playback
  // This is a simplified version - in a real app you'd use a proper MIDI synthesizer
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  melody.notes.forEach((note, index) => {
    setTimeout(() => {
      // Create oscillator for each note
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Convert MIDI note to frequency
      const frequency = 440 * Math.pow(2, (note.pitch - 69) / 12);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = getOscillatorType(melody.genre);
      
      // Set volume based on velocity
      const volume = (note.velocity / 127) * 0.1; // Keep volume low
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + note.duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + note.duration);
    }, note.time * 1000); // Convert to milliseconds
  });
};

const getOscillatorType = (genre: string): OscillatorType => {
  const typeMap: { [key: string]: OscillatorType } = {
    classical: 'sine',
    jazz: 'triangle',
    electronic: 'square',
    ambient: 'sine',
    minimalist: 'sine',
    baroque: 'triangle'
  };
  return typeMap[genre] || 'sine';
};

// Download melody as MIDI file (simplified - would need a proper MIDI library)
export const downloadMIDI = (melody: Melody, filename: string) => {
  // This is a simplified version. In a real implementation, you'd use a library like 'midi-writer-js'
  const midiData = createSimpleMIDI(melody);
  const blob = new Blob([midiData], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Simplified MIDI file creation (basic implementation)
const createSimpleMIDI = (melody: Melody): Uint8Array => {
  // This is a very basic MIDI file structure
  // In a real app, you'd use a proper MIDI library
  const header = new Uint8Array([
    0x4D, 0x54, 0x68, 0x64, // "MThd"
    0x00, 0x00, 0x00, 0x06, // Header length
    0x00, 0x00, // Format type 0
    0x00, 0x01, // One track
    0x00, 0x60  // 96 ticks per quarter note
  ]);
  
  // Simplified track data
  const trackData = new Uint8Array([
    0x4D, 0x54, 0x72, 0x6B, // "MTrk"
    0x00, 0x00, 0x00, 0x20, // Track length (approximate)
    // ... simplified MIDI events would go here
    0x00, 0xFF, 0x2F, 0x00  // End of track
  ]);
  
  const result = new Uint8Array(header.length + trackData.length);
  result.set(header, 0);
  result.set(trackData, header.length);
  
  return result;
};
