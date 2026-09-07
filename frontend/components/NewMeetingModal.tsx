"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import { useRouter } from "next/navigation";

export default function NewMeetingModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Title is required", "error");
      return;
    }
    setLoading(true);
    try {
      const meeting = await api.createMeeting({
        title,
        participant_names: participants
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        transcript_text: transcript || null,
      });
      showToast("Meeting created");
      onClose();
      router.push(`/meetings/${meeting.id}`);
    } catch (err: any) {
      showToast(err.message || "Failed to create meeting", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">New Meeting</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly Sync"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Participants (comma separated)</label>
            <input
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="Alex Carter, Priya Nair"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Paste transcript (optional — format: [00:00:05] Speaker: text)
            </label>
            <textarea
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-brand"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-brand text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
