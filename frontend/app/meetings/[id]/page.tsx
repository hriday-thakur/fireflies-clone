"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Player from "@/components/Player";
import TranscriptPanel from "@/components/TranscriptPanel";
import SummaryPanel from "@/components/SummaryPanel";
import ActionItems from "@/components/ActionItems";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import { MeetingDetail } from "@/types";

export default function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  async function load() {
    const data = await api.getMeeting(id);
    setMeeting(data);
    setTitleDraft(data.title);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function saveTitle() {
    if (!meeting) return;
    try {
      await api.updateMeeting(meeting.id, { title: titleDraft });
      showToast("Meeting updated");
      setEditingTitle(false);
      load();
    } catch (err: any) {
      showToast(err.message || "Failed to update", "error");
    }
  }

  async function handleDelete() {
    if (!meeting) return;
    if (!confirm("Delete this meeting? This cannot be undone.")) return;
    try {
      await api.deleteMeeting(meeting.id);
      showToast("Meeting deleted");
      router.push("/meetings");
    } catch (err: any) {
      showToast(err.message || "Failed to delete", "error");
    }
  }

  function handleSeek(t: number) {
    setCurrentTime(t);
  }

  if (!meeting) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <p className="text-center text-gray-400 mt-20">Loading meeting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex-1 min-w-0">
            {editingTitle ? (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  className="text-2xl font-semibold border-b border-brand focus:outline-none bg-transparent"
                />
                <button onClick={saveTitle} className="text-sm text-brand font-medium">
                  Save
                </button>
                <button onClick={() => setEditingTitle(false)} className="text-sm text-gray-400">
                  Cancel
                </button>
              </div>
            ) : (
              <h1
                className="text-2xl font-semibold text-gray-900 cursor-pointer hover:text-brand truncate"
                onClick={() => setEditingTitle(true)}
                title="Click to edit"
              >
                {meeting.title}
              </h1>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {new Date(meeting.date).toLocaleString()} ·{" "}
              {meeting.participants.map((p) => p.name).join(", ")}
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="text-sm text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 shrink-0"
          >
            Delete Meeting
          </button>
        </div>

        <div className="mb-6">
          <Player
            mediaUrl={meeting.media_url}
            duration={meeting.duration_seconds}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTimeUpdate={setCurrentTime}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onSeek={handleSeek}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TranscriptPanel segments={meeting.segments} currentTime={currentTime} onSeek={handleSeek} />
          </div>
          <div className="space-y-6">
            <SummaryPanel summary={meeting.summary} topics={meeting.topics} onSeek={handleSeek} />
            <ActionItems meetingId={meeting.id} items={meeting.action_items} onChange={load} />
          </div>
        </div>
      </main>
    </div>
  );
}
