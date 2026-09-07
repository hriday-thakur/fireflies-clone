// These mirror the Pydantic schemas in backend/app/schemas.py exactly,
// so the frontend and backend stay in sync on data shape.

export interface Participant {
  id: number;
  name: string;
  email?: string | null;
}

export interface TranscriptSegment {
  id: number;
  speaker_name: string;
  start_time_seconds: number;
  end_time_seconds: number;
  text: string;
  order_index: number;
}

export interface Topic {
  id: number;
  title: string;
  start_time_seconds: number;
  order_index: number;
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  text: string;
  assignee?: string | null;
  is_completed: boolean;
  source_segment_id?: number | null;
  created_at: string;
}

export interface Summary {
  overview: string;
  generated_at: string;
}

export interface MeetingListItem {
  id: number;
  title: string;
  date: string;
  duration_seconds: number;
  participants: Participant[];
}

export interface MeetingDetail extends MeetingListItem {
  media_url?: string | null;
  segments: TranscriptSegment[];
  topics: Topic[];
  action_items: ActionItem[];
  summary?: Summary | null;
}
