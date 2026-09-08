"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import MeetingCard from "@/components/MeetingCard";
import NewMeetingModal from "@/components/NewMeetingModal";
import { api } from "@/lib/api";
import { MeetingListItem } from "@/types";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [q, setQ] = useState("");
  const [participant, setParticipant] = useState("");
  const [sort, setSort] = useState("recent");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listMeetings({ q, participant, sort });
      setMeetings(data);
    } catch (err) {
      console.error("Failed to load meetings:", err);
      setError(
        "Couldn't reach the server. It may be waking up from idle — this can take up to a minute on first load."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(load, 250); // debounce typing in search boxes
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, participant, sort]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Meetings</h1>
            <p className="text-sm text-gray-500 mt-1">All your past meetings in one place.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-dark"
          >
            + New Meeting
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <input
            value={participant}
            onChange={(e) => setParticipant(e.target.value)}
            placeholder="Filter by participant..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading meetings...</p>
        ) : error ? (
          <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}{" "}
            <button onClick={load} className="underline font-medium ml-1">
              Retry
            </button>
          </div>
        ) : meetings.length === 0 ? (
          <p className="text-sm text-gray-400">No meetings found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {meetings.map((m) => (
              <MeetingCard key={m.id} meeting={m} />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <NewMeetingModal
          onClose={() => {
            setShowModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}