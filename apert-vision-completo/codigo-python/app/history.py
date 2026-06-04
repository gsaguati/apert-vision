import json
from pathlib import Path
from datetime import datetime

HISTORY_FILE = Path.home() / ".apert_vision" / "history.json"


def load() -> list[dict]:
    if not HISTORY_FILE.exists():
        return []
    try:
        return json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []


def save_match(stats: dict, team_local: str, team_visit: str, video_name: str) -> dict:
    history = load()
    counts  = stats.get("event_counts", {})
    entry = {
        "id":              len(history) + 1,
        "date":            datetime.now().strftime("%d/%m/%Y  %H:%M"),
        "video":           video_name,
        "team_local":      team_local  or "Local",
        "team_visit":      team_visit  or "Visitante",
        "total_events":    stats.get("total_events", 0),
        "lineouts":        counts.get("lineout",  0),
        "scrums":          counts.get("scrum",    0),
        "kickoffs":        counts.get("kickoff",  0),
        "duration_sec":    stats.get("video_duration_sec", 0),
        "processing_time": stats.get("processing_time_sec", 0),
        "output_path":     stats.get("output_path", ""),
    }
    history.insert(0, entry)
    HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
    HISTORY_FILE.write_text(
        json.dumps(history, indent=2, ensure_ascii=False), encoding="utf-8")
    return entry
