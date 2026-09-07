// Single place all backend HTTP calls go through, so the base URL and
// error handling only need to be written once.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  listMeetings: (params: { q?: string; participant?: string; sort?: string } = {}) => {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.participant) search.set("participant", params.participant);
    if (params.sort) search.set("sort", params.sort);
    const qs = search.toString();
    return request(`/meetings${qs ? `?${qs}` : ""}`);
  },
  getMeeting: (id: number | string) => request(`/meetings/${id}`),
  createMeeting: (data: any) =>
    request(`/meetings`, { method: "POST", body: JSON.stringify(data) }),
  updateMeeting: (id: number | string, data: any) =>
    request(`/meetings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteMeeting: (id: number | string) =>
    request(`/meetings/${id}`, { method: "DELETE" }),
  searchTranscript: (id: number | string, q: string) =>
    request(`/meetings/${id}/transcript/search?q=${encodeURIComponent(q)}`),
  globalSearch: (q: string) => request(`/search?q=${encodeURIComponent(q)}`),
  createActionItem: (meetingId: number | string, data: any) =>
    request(`/meetings/${meetingId}/action-items`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateActionItem: (id: number | string, data: any) =>
    request(`/action-items/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteActionItem: (id: number | string) =>
    request(`/action-items/${id}`, { method: "DELETE" }),
};
