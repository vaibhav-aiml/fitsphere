declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Track {
  id: string;
  name: string;
  artist: string;
  bpm: number;
  mood: string;
  youtubeId: string;
}

export default function MusicIntegration() {
  const router = useRouter();
  const [selectedBPM, setSelectedBPM] = useState(127);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [volume, setVolume] = useState(70);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Popular Workout Songs with YouTube IDs (working and accessible)
  const tracks: Track[] = [
    { id: '1', name: 'Waka Waka (This Time for Africa)', artist: 'Shakira', bpm: 127, mood: 'Energetic', youtubeId: 'pRpeEdMmmQ0' },
    { id: '2', name: 'My House', artist: 'Flo Rida', bpm: 128, mood: 'Party', youtubeId: 'P05pC1KZ-uk' },
    { id: '3', name: 'Eye of the Tiger', artist: 'Survivor', bpm: 109, mood: 'Motivational', youtubeId: 'btPJPFnesV4' },
    { id: '4', name: 'Lose Yourself', artist: 'Eminem', bpm: 171, mood: 'Intense', youtubeId: 'xFYQQPAOz7Y' },
    { id: '5', name: 'Till I Collapse', artist: 'Eminem', bpm: 171, mood: 'Aggressive', youtubeId: 'rZcB6e3B6E4' },
    { id: '6', name: 'Stronger', artist: 'Kanye West', bpm: 104, mood: 'Powerful', youtubeId: 'PsO6ZnUZI0g' },
    { id: '7', name: 'Remember the Name', artist: 'Fort Minor', bpm: 140, mood: 'Aggressive', youtubeId: 'VDvr08sCPOc' },
    { id: '8', name: 'Hall of Fame', artist: 'The Script', bpm: 170, mood: 'Inspirational', youtubeId: 'mYvWahD8j3g' },
    { id: '9', name: "Can't Hold Us", artist: 'Macklemore', bpm: 146, mood: 'High Energy', youtubeId: '2zNSgSzhBfM' },
    { id: '10', name: 'Uptown Funk', artist: 'Bruno Mars', bpm: 115, mood: 'Energetic', youtubeId: 'OPf0YbXqDm0' },
    { id: '11', name: 'Happy', artist: 'Pharrell Williams', bpm: 160, mood: 'Upbeat', youtubeId: 'y6Sxv-sUYtM' },
    { id: '12', name: 'Titanium', artist: 'David Guetta', bpm: 126, mood: 'Epic', youtubeId: 'JRfuAukYTKg' },
    { id: '13', name: 'Levels', artist: 'Avicii', bpm: 128, mood: 'Euphoric', youtubeId: '_ovdm2yX4MA' },
    { id: '14', name: 'Wake Me Up', artist: 'Avicii', bpm: 124, mood: 'Uplifting', youtubeId: 'IcrbM1l_BoI' },
    { id: '15', name: 'Animals', artist: 'Martin Garrix', bpm: 128, mood: 'Intense', youtubeId: 'gCYcHz2k5x0' },
    { id: '16', name: 'Industry Baby', artist: 'Lil Nas X', bpm: 150, mood: 'Confident', youtubeId: 'UThlL6taJ6w' },
    { id: '17', name: 'HUMBLE', artist: 'Kendrick Lamar', bpm: 150, mood: 'Aggressive', youtubeId: 'tvTRZJ-4EyI' },
    { id: '18', name: 'Sicko Mode', artist: 'Travis Scott', bpm: 155, mood: 'High Energy', youtubeId: '6ONRf7h3Mdk' },
    { id: '19', name: 'Work B**ch', artist: 'Britney Spears', bpm: 130, mood: 'Intense', youtubeId: 'pt8VYOfr8To' },
    { id: '20', name: 'Bang Bang', artist: 'Jessie J', bpm: 140, mood: 'Explosive', youtubeId: '0HDdjwpPM3Y' }
  ];

  // Load YouTube API
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
  }, []);

  const playWorkoutMusic = (bpm: number, track?: Track) => {
    setSelectedBPM(bpm);
    let tracksToPlay = tracks.filter(t => Math.abs(t.bpm - bpm) <= 15);
    
    if (tracksToPlay.length === 0) {
      tracksToPlay = tracks;
    }
    
    const selectedTrack = track || tracksToPlay[0];
    
    // Remove existing player
    if (playerRef.current && playerRef.current.destroy) {
      playerRef.current.destroy();
    }
    
    // Create new YouTube player
    if (containerRef.current && window.YT && window.YT.Player) {
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '360',
        width: '100%',
        videoId: selectedTrack.youtubeId,
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          controls: 1,
          enablejsapi: 1
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
            setIsPlaying(true);
            toast.success(`🎵 Now playing: ${selectedTrack.name} - ${selectedTrack.artist}`);
          },
          onError: () => {
            toast.error('Video cannot be played. Try another song.');
          }
        }
      });
    } else {
      // Fallback: open in new tab
      window.open(`https://www.youtube.com/watch?v=${selectedTrack.youtubeId}`, '_blank');
      toast(`Opening ${selectedTrack.name} in YouTube`, { icon: '🎵' });
    }
    
    setCurrentTrack(selectedTrack);
  };

  const stopMusic = () => {
    if (playerRef.current && playerRef.current.stopVideo) {
      playerRef.current.stopVideo();
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    toast.success('Music stopped');
  };

  const pauseMusic = () => {
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  };

  const resumeMusic = () => {
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const next = tracks[(currentIndex + 1) % tracks.length];
    playWorkoutMusic(next.bpm, next);
  };

  const workoutPresets = [
    { name: 'Warm-up', bpm: 100, icon: '🌡️', color: 'bg-green-600' },
    { name: 'Strength Training', bpm: 110, icon: '💪', color: 'bg-blue-600' },
    { name: 'Powerlifting', bpm: 115, icon: '🏋️', color: 'bg-red-600' },
    { name: 'Bodybuilding', bpm: 125, icon: '💪', color: 'bg-purple-600' },
    { name: 'Cardio / HIIT', bpm: 140, icon: '🔥', color: 'bg-orange-600' },
    { name: 'Cool Down', bpm: 90, icon: '🧘', color: 'bg-teal-600' }
  ];

  const getWorkoutTypeByBPM = (bpm: number) => {
    if (bpm <= 100) return 'Warm-up / Cool Down';
    if (bpm <= 115) return 'Strength Training';
    if (bpm <= 130) return 'Bodybuilding / Cardio';
    return 'HIIT / Intense Cardio';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="text-blue-500 hover:text-blue-400 transition mb-2 block"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">🎵 Workout Music</h1>
            <p className="text-gray-400 mt-1">Popular English workout songs to power your training</p>
          </div>
        </div>

        {/* YouTube Player Container */}
        <div className="bg-black rounded-xl overflow-hidden mb-6 shadow-xl">
          <div 
            ref={containerRef} 
            id="youtube-player-container"
            className="w-full"
          />
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/30 p-3 rounded-lg mb-6 text-center">
          <p className="text-gray-300 text-sm">
            🎵 <span className="text-yellow-400">Click any workout type or song below</span> to start playing!
            If video doesn't autoplay, click the ▶️ play button on the video.
          </p>
        </div>

        {/* Now Playing Bar */}
        {isPlaying && currentTrack && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl mb-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl animate-pulse">🎧</div>
                <div>
                  <p className="text-white text-xs">NOW PLAYING</p>
                  <p className="text-white font-bold">{currentTrack.name}</p>
                  <p className="text-white/70 text-sm">{currentTrack.artist} • {currentTrack.bpm} BPM</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={resumeMusic} className="bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition">▶️</button>
                <button onClick={pauseMusic} className="bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition">⏸️</button>
                <button onClick={nextTrack} className="bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition">⏭️</button>
                <button onClick={stopMusic} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">⏹️ Stop</button>
              </div>
            </div>
          </div>
        )}

        {/* Workout Type Presets */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">🎚️ Select Your Workout Type</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {workoutPresets.map((workout) => (
              <button
                key={workout.name}
                onClick={() => playWorkoutMusic(workout.bpm)}
                className={`${workout.color} p-3 rounded-lg hover:opacity-80 transition text-white text-center`}
              >
                <div className="text-2xl mb-1">{workout.icon}</div>
                <p className="font-semibold text-sm">{workout.name}</p>
                <p className="text-xs opacity-80">{workout.bpm} BPM</p>
              </button>
            ))}
          </div>

          {/* BPM Slider */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-300 text-sm">Custom BPM</label>
              <span className="text-lg font-bold text-blue-400">{selectedBPM} BPM</span>
            </div>
            <label className="text-gray-400 text-xs mb-2 block">{getWorkoutTypeByBPM(selectedBPM)}</label>
            <input
              type="range"
              min="60"
              max="180"
              step="5"
              value={selectedBPM}
              onChange={(e) => setSelectedBPM(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <button
              onClick={() => playWorkoutMusic(selectedBPM)}
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
            >
              🎵 Play {selectedBPM} BPM Workout Mix
            </button>
          </div>
        </div>

        {/* All Songs List */}
        <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">🎵 All Workout Songs ({tracks.length} tracks)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
            {tracks.map(track => (
              <button
                key={track.id}
                onClick={() => playWorkoutMusic(track.bpm, track)}
                className="text-left text-sm text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded transition flex items-center justify-between"
              >
                <div className="flex-1 truncate">
                  <span className="font-medium">{track.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({track.bpm} BPM)</span>
                </div>
                <span className="text-xs text-blue-400 ml-2">▶️</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-gray-500 text-xs">
          💡 Tip: Click any song to play the official music video. Adjust volume using your device controls.
        </div>
      </div>
    </div>
  );
}