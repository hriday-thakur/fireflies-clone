"use client";
import { Summary, Topic } from "@/types";

interface Props {
  summary?: Summary | null;
  topics: Topic[];
  onSeek: (t: number) => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SummaryPanel({ summary, topics, onSeek }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">AI Summary</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          {summary?.overview || "No summary generated yet."}
        </p>
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Key Topics</h3>
        <div className="space-y-1">
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => onSeek(t.start_time_seconds)}
              className="w-full text-left text-sm text-gray-700 hover:text-brand hover:bg-brand-light rounded-lg px-2 py-1.5 flex justify-between"
            >
              <span>{t.title}</span>
              <span className="text-xs text-gray-400">{formatTime(t.start_time_seconds)}</span>
            </button>
          ))}
          {topics.length === 0 && <p className="text-sm text-gray-400">No topics yet.</p>}
        </div>
      </div>
    </div>
  );
}
