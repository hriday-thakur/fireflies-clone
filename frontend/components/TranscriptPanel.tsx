"use client";
import { useEffect, useRef, useState } from "react";
import { TranscriptSegment } from "@/types";

interface Props {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (t: number) => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function highlight(text: string, query: string) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function TranscriptPanel({ segments, currentTime, onSeek }: Props) {
  const [query, setQuery] = useState("");
  const activeRef = useRef<HTMLDivElement>(null);

  // Active segment = the last one whose start time has already passed.
  const activeSegment = [...segments].reverse().find((s) => currentTime >= s.start_time_seconds);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeSegment?.id]);

  const filtered = query
    ? segments.filter((s) => s.text.toLowerCase().includes(query.toLowerCase()))
    : segments;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Transcript</h3>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search transcript..."
          className="border border-gray-300 rounded-lg px-2 py-1 text-xs w-40 focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
      <div className="overflow-y-auto flex-1 space-y-3 pr-1" style={{ maxHeight: "60vh" }}>
        {filtered.map((seg) => {
          const isActive = activeSegment?.id === seg.id;
          return (
            <div
              key={seg.id}
              ref={isActive ? activeRef : undefined}
              onClick={() => onSeek(seg.start_time_seconds)}
              className={`cursor-pointer rounded-lg p-2 transition ${
                isActive ? "bg-brand-light" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <span className="font-semibold text-gray-700">{seg.speaker_name}</span>
                <span>{formatTime(seg.start_time_seconds)}</span>
              </div>
              <p className="text-sm text-gray-800">{highlight(seg.text, query)}</p>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-gray-400">No matching transcript lines.</p>}
      </div>
    </div>
  );
}
