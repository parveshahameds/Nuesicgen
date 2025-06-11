
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
  
  const notes: Note[] = [];
  const noteCount = duration * 4;
  
  const scalePatterns: { [key: string]: number[] } = {
    'C': [60, 62, 64, 65, 67, 69, 71, 72],
    'G': [67, 69, 71, 72, 74, 76, 78, 79],
    'D': [62, 64, 66, 67, 69, 71, 73, 74],
    'A': [69, 71, 73, 74, 76, 78, 80, 81],
    'Am': [69, 71, 72, 74, 76, 77, 79, 81],
    'Em': [64, 66, 67, 69, 71, 72, 74, 76],
    'Dm': [62, 64, 65, 67, 69, 70, 72, 74],
  };

  const scale = scalePatterns[key] || scalePatterns['C'];
  
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
  let lastPitch = scale[Math.floor(scale.length / 2)];

  for (let i = 0; i < noteCount; i++) {
    const pitchVariation = Math.floor((Math.random() - 0.5) * 2 * settings.jumpRange * creativity);
    let scaleIndex = scale.indexOf(lastPitch);
    
    if (scaleIndex === -1) scaleIndex = 0;
    
    scaleIndex = Math.max(0, Math.min(scale.length - 1, scaleIndex + pitchVariation));
    const pitch = scale[scaleIndex] + (Math.random() > 0.8 ? 12 : 0);
    
    const baseDuration = 0.25;
    const rhythmFactor = 1 + (Math.random() - 0.5) * settings.rhythmVariety * creativity;
    const duration = Math.max(0.125, baseDuration * rhythmFactor);
    
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
export const playMIDI = async (melody: Melody, audioElement: HTMLAudioElement | null) => {
  if (!audioElement) return;

  try {
    // Create audio context
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    
    // Resume audio context if suspended (required by modern browsers)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    console.log('Starting audio playback with', melody.notes.length, 'notes');
    
    // Create master gain for volume control
    const masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.setValueAtTime(0.3, audioContext.currentTime); // Increased volume
    
    melody.notes.forEach((note, index) => {
      const startTime = audioContext.currentTime + (note.time * 0.5); // Slow down playback
      
      // Create oscillator for each note
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(masterGain);
      
      // Convert MIDI note to frequency
      const frequency = 440 * Math.pow(2, (note.pitch - 69) / 12);
      
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.type = getOscillatorType(melody.genre);
      
      // Set envelope (ADSR)
      const noteDuration = note.duration * 0.5; // Match the slowed down playback
      const velocity = note.velocity / 127;
      const volume = velocity * 0.5; // Increased base volume
      
      // Attack
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      
      // Sustain and Release
      gainNode.gain.setValueAtTime(volume, startTime + noteDuration * 0.8);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + noteDuration);
      
      console.log(`Note ${index + 1}: ${note.pitch} (${frequency.toFixed(1)}Hz) at ${startTime.toFixed(2)}s`);
    });

    // Calculate total duration and set a timeout to clean up
    const totalDuration = Math.max(...melody.notes.map(note => note.time + note.duration)) * 0.5;
    setTimeout(() => {
      console.log('Playback finished');
    }, totalDuration * 1000 + 1000);

  } catch (error) {
    console.error('Audio playback error:', error);
    throw error;
  }
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

const createSimpleMIDI = (melody: Melody): Uint8Array => {
  const header = new Uint8Array([
    0x4D, 0x54, 0x68, 0x64,
    0x00, 0x00, 0x00, 0x06,
    0x00, 0x00,
    0x00, 0x01,
    0x00, 0x60
  ]);
  
  const trackData = new Uint8Array([
    0x4D, 0x54, 0x72, 0x6B,
    0x00, 0x00, 0x00, 0x20,
    0x00, 0xFF, 0x2F, 0x00
  ]);
  
  const result = new Uint8Array(header.length + trackData.length);
  result.set(header, 0);
  result.set(trackData, header.length);
  
  return result;
};
