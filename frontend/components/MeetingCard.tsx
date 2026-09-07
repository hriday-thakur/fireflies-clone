import Link from "next/link";
import { MeetingListItem } from "@/types";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function MeetingCard({ meeting }: { meeting: MeetingListItem }) {
  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-brand transition"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
          {formatDuration(meeting.duration_seconds)}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-1">{formatDate(meeting.date)}</p>
      <div className="flex items-center gap-2 mt-4">
        {meeting.participants.slice(0, 4).map((p) => (
          <div
            key={p.id}
            title={p.name}
            className="w-7 h-7 rounded-full bg-brand-light text-brand text-xs flex items-center justify-center font-medium"
          >
            {p.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
        ))}
        {meeting.participants.length > 4 && (
          <span className="text-xs text-gray-400">+{meeting.participants.length - 4}</span>
        )}
      </div>
    </Link>
  );
}
