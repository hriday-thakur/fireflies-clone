"""
Utility functions that fake the "AI" parts of Fireflies without calling any
real speech-to-text or LLM API (per the assignment: this is out of scope).

parse_transcript: turns raw pasted/uploaded text into structured segments.
generate_mock_summary / generate_mock_topics / generate_mock_action_items:
turn those segments into summary/topics/action-items using simple heuristics.
"""
import re

TIMESTAMP_PATTERN = re.compile(r"^\[?(\d{1,2}):(\d{2})(?::(\d{2}))?\]?\s*(.*)$")
SPEAKER_PATTERN = re.compile(r"^([A-Za-z0-9 ._'-]+):\s*(.*)$")


def parse_transcript(text: str):
    """
    Parses lines like:
        [00:01:15] Alice: Let's get started with the roadmap.
    or plain lines without timestamps:
        Alice: Let's get started.
    Returns a list of dicts ready to become TranscriptSegment rows.
    """
    lines = [l.strip() for l in text.strip().splitlines() if l.strip()]
    segments = []
    current_time = 0.0

    for idx, line in enumerate(lines):
        ts_match = TIMESTAMP_PATTERN.match(line)
        remainder = line
        start_time = current_time

        if ts_match:
            h_or_m, m_or_s, s, remainder = ts_match.groups()
            if s is not None:
                start_time = int(h_or_m) * 3600 + int(m_or_s) * 60 + int(s)
            else:
                start_time = int(h_or_m) * 60 + int(m_or_s)

        speaker_match = SPEAKER_PATTERN.match(remainder)
        if speaker_match:
            speaker, text_content = speaker_match.groups()
        else:
            speaker, text_content = "Unknown Speaker", remainder

        end_time = start_time + 5  # assume ~5s per line when no explicit end time
        segments.append({
            "speaker_name": speaker.strip(),
            "start_time_seconds": float(start_time),
            "end_time_seconds": float(end_time),
            "text": text_content.strip(),
            "order_index": idx,
        })
        current_time = end_time

    return segments


def generate_mock_summary(segments):
    """Simple templated 'AI summary' — no external LLM call, fully deterministic."""
    if not segments:
        return "No transcript available to summarize."
    speakers = sorted(set(s["speaker_name"] for s in segments))
    preview = " ".join(s["text"] for s in segments[:3])[:200]
    return (
        f"This meeting had {len(speakers)} participant(s) "
        f"({', '.join(speakers)}) across {len(segments)} discussion points. "
        f"The conversation opened with: \"{preview}...\" and continued "
        f"through project updates, decisions, and next steps."
    )


def generate_mock_action_items(segments):
    """Naive keyword heuristic: lines with action-oriented phrasing become action items."""
    keywords = ["will", "need to", "should", "follow up", "let's", "going to", "i'll"]
    items = []
    for seg in segments:
        lower = seg["text"].lower()
        if any(k in lower for k in keywords):
            items.append({
                "text": seg["text"],
                "assignee": seg["speaker_name"],
            })
    return items[:8]


def generate_mock_topics(segments):
    """Splits the transcript into ~3 roughly equal 'chapters' for the outline view."""
    if not segments:
        return []
    chunk_size = max(1, len(segments) // 3)
    titles = ["Opening & Context", "Main Discussion", "Wrap-up & Next Steps"]
    topics = []
    for i in range(0, len(segments), chunk_size):
        chunk = segments[i:i + chunk_size]
        if not chunk:
            continue
        idx = len(topics)
        title = titles[idx] if idx < len(titles) else f"Topic {idx + 1}"
        topics.append({
            "title": title,
            "start_time_seconds": chunk[0]["start_time_seconds"],
            "order_index": idx,
        })
    return topics
