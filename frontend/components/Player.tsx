"use client";
import { useEffect, useRef } from "react";

interface PlayerProps {
  mediaUrl?: string | null;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (t: number) => void;
  onTogglePlay: () => void;
  onSeek: (t: number) => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Player({
  mediaUrl,
  duration,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onTogglePlay,
  onSeek,
}: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Real <audio> element sync — only relevant if a media file is attached.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (Math.abs(audio.currentTime - currentTime) > 0.5) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  // Simulated clock — drives the seek bar when there's no real media file
  // (which is the default for seeded/mocked meetings per the assignment).
  useEffect(() => {
    if (mediaUrl || !isPlaying) return;
    const interval = setInterval(() => {
      onTimeUpdate(Math.min(currentTime + 1, duration));
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentTime, mediaUrl, duration]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      {mediaUrl && (
        <audio
          ref={audioRef}
          src={mediaUrl}
          onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
        />
      )}
      <div className="flex items-center gap-4">
        <button
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand-dark shrink-0"
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>
        <span className="text-xs text-gray-500 w-10">{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 1}
          value={currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="flex-1 accent-brand"
        />
        <span className="text-xs text-gray-500 w-10">{formatTime(duration)}</span>
      </div>
      {!mediaUrl && (
        <p className="text-[11px] text-gray-400 mt-2">
          No audio file attached — simulated playback for demo purposes.
        </p>
      )}
    </div>
  );
}
