
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Download, Music, Zap, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { generateMelody, playMIDI, downloadMIDI } from '@/utils/musicUtils';
import WaveformVisualizer from './WaveformVisualizer';
import MIDIVisualizer from './MIDIVisualizer';

const MusicGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMelody, setCurrentMelody] = useState<any>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // Generation parameters
  const [genre, setGenre] = useState('classical');
  const [creativity, setCreativity] = useState([0.7]);
  const [tempo, setTempo] = useState([120]);
  const [keySignature, setKeySignature] = useState('C');
  const [duration, setDuration] = useState([32]);

  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Simulate neural network processing with progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const melody = await generateMelody({
        genre,
        creativity: creativity[0],
        tempo: tempo[0],
        key: keySignature,
        duration: duration[0]
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      setTimeout(() => {
        setCurrentMelody(melody);
        setIsGenerating(false);
        setGenerationProgress(0);
        toast.success('🎵 New composition generated!');
      }, 500);

    } catch (error) {
      setIsGenerating(false);
      setGenerationProgress(0);
      toast.error('Failed to generate music. Please try again.');
      console.error('Generation error:', error);
    }
  };

  const handlePlayPause = () => {
    if (!currentMelody) return;
    
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      playMIDI(currentMelody, audioRef.current);
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (!currentMelody) return;
    downloadMIDI(currentMelody, `neural-composition-${Date.now()}.mid`);
    toast.success('🎼 MIDI file downloaded!');
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <audio ref={audioRef} />
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Music className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-white">Neusicgen</h1>
        </div>
        <p className="text-purple-200">AI-powered music composition using deep learning</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Control Panel */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Generation Controls */}
          <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Generation Parameters</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Genre</label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="classical">Classical</SelectItem>
                    <SelectItem value="jazz">Jazz</SelectItem>
                    <SelectItem value="electronic">Electronic</SelectItem>
                    <SelectItem value="ambient">Ambient</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="baroque">Baroque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Creativity: {creativity[0].toFixed(1)}
                </label>
                <Slider
                  value={creativity}
                  onValueChange={setCreativity}
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Tempo: {tempo[0]} BPM
                </label>
                <Slider
                  value={tempo}
                  onValueChange={setTempo}
                  min={60}
                  max={180}
                  step={5}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Key Signature</label>
                <Select value={keySignature} onValueChange={setKeySignature}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="C">C Major</SelectItem>
                    <SelectItem value="G">G Major</SelectItem>
                    <SelectItem value="D">D Major</SelectItem>
                    <SelectItem value="A">A Major</SelectItem>
                    <SelectItem value="Am">A Minor</SelectItem>
                    <SelectItem value="Em">E Minor</SelectItem>
                    <SelectItem value="Dm">D Minor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Duration: {duration[0]} bars
                </label>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  min={8}
                  max={64}
                  step={4}
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          {/* Generation Button */}
          <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Generating... {Math.round(generationProgress)}%
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Generate Music
                </div>
              )}
            </Button>
            
            {isGenerating && (
              <div className="mt-3">
                <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300 ease-out"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Visualization Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Playback Controls */}
          {currentMelody && (
            <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4  bg-black">Playback</h3>
              <div className="flex gap-3">
                <Button
                  onClick={handlePlayPause}
                  variant="outline"
                  className="flex-1 border-slate-600 text-white hover:bg-black"
                >
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-black"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Waveform Visualizer */}
          <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Audio Visualization</h3>
            <WaveformVisualizer 
              isGenerating={isGenerating} 
              isPlaying={isPlaying}
              melody={currentMelody}
            />
          </Card>

          {/* MIDI Visualizer */}
          <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Note Sequence</h3>
            <MIDIVisualizer 
              melody={currentMelody}
              isPlaying={isPlaying}
            />
          </Card>

        </div>
      </div>
    </div>
  );
};

export default MusicGenerator;
