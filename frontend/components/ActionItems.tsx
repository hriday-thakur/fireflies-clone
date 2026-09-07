"use client";
import { useState } from "react";
import { ActionItem } from "@/types";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";

interface Props {
  meetingId: number;
  items: ActionItem[];
  onChange: () => void;
}

export default function ActionItems({ meetingId, items, onChange }: Props) {
  const [newText, setNewText] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const { showToast } = useToast();

  async function toggleComplete(item: ActionItem) {
    try {
      await api.updateActionItem(item.id, { is_completed: !item.is_completed });
      onChange();
    } catch (err: any) {
      showToast(err.message || "Failed to update", "error");
    }
  }

  async function remove(item: ActionItem) {
    try {
      await api.deleteActionItem(item.id);
      showToast("Action item deleted");
      onChange();
    } catch (err: any) {
      showToast(err.message || "Failed to delete", "error");
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newText.trim()) return;
    try {
      await api.createActionItem(meetingId, { text: newText, assignee: newAssignee || null });
      setNewText("");
      setNewAssignee("");
      showToast("Action item added");
      onChange();
    } catch (err: any) {
      showToast(err.message || "Failed to add", "error");
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Action Items</h3>
      <div className="space-y-2 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-2 group">
            <input
              type="checkbox"
              checked={item.is_completed}
              onChange={() => toggleComplete(item)}
              className="mt-1 accent-brand"
            />
            <div className="flex-1">
              <p className={`text-sm ${item.is_completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                {item.text}
              </p>
              {item.assignee && <span className="text-xs text-gray-400">Assigned to {item.assignee}</span>}
            </div>
            <button
              onClick={() => remove(item)}
              className="text-xs text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">No action items yet.</p>}
      </div>
      <form onSubmit={addItem} className="flex gap-2">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add action item..."
          className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <input
          value={newAssignee}
          onChange={(e) => setNewAssignee(e.target.value)}
          placeholder="Assignee"
          className="w-28 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <button type="submit" className="bg-brand text-white text-sm px-3 py-1.5 rounded-lg hover:bg-brand-dark">
          Add
        </button>
      </form>
    </div>
  );
}
