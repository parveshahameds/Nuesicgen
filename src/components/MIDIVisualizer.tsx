
import React from 'react';

interface MIDIVisualizerProps {
  melody: any;
  isPlaying: boolean;
}

const MIDIVisualizer: React.FC<MIDIVisualizerProps> = ({ melody, isPlaying }) => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  const getNoteColor = (noteIndex: number) => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', 
      '#84cc16', '#22c55e', '#10b981', '#14b8a6',
      '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1'
    ];
    return colors[noteIndex % 12];
  };

  if (!melody) {
    return (
      <div className="w-full h-48 bg-slate-900/50 rounded-lg flex items-center justify-center">
        <p className="text-slate-400">Generate music to see note visualization</p>
      </div>
    );
  }

  return (
    <div className="w-full h-48 bg-slate-900/50 rounded-lg p-4 overflow-x-auto">
      <div className="flex gap-1 h-full min-w-max">
        {melody.notes.map((note: any, index: number) => {
          const noteHeight = ((note.pitch - 40) / 40) * 100; // Scale note height
          const noteColor = getNoteColor(note.pitch % 12);
          const noteName = noteNames[note.pitch % 12];
          
          return (
            <div
              key={index}
              className="relative flex flex-col justify-end group"
              style={{ width: '12px' }}
            >
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  isPlaying ? 'animate-pulse' : ''
                }`}
                style={{
                  height: `${Math.max(noteHeight, 10)}%`,
                  backgroundColor: noteColor,
                  opacity: isPlaying ? 0.8 : 0.6
                }}
              />
              
              {/* Note name tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1 py-0.5 bg-slate-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {noteName}{Math.floor(note.pitch / 12)}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Piano roll reference */}
      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>Low</span>
        <span>Notes in sequence →</span>
        <span>High</span>
      </div>
    </div>
  );
};

export default MIDIVisualizer;
