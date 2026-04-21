"""
Transcribe lecture mp4 files using Whisper API.
Run once: python3 scripts/transcribe.py
"""

import os
import subprocess
import json
import math
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
LECTURE_DIR = Path(__file__).parent.parent / "src" / "data" / "lecture"
MAX_SIZE_MB = 24


def extract_audio(mp4_path, mp3_path):
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(mp4_path),
            "-vn", "-ac", "1", "-ar", "16000", "-b:a", "32k",
            str(mp3_path),
        ],
        capture_output=True,
    )


def get_duration(path):
    r = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True,
    )
    return float(r.stdout.strip())


def split_audio(mp3_path, max_size_mb=MAX_SIZE_MB):
    size_mb = mp3_path.stat().st_size / 1024 / 1024
    if size_mb <= max_size_mb:
        return [mp3_path]

    duration = get_duration(mp3_path)
    n_parts = math.ceil(size_mb / max_size_mb)
    chunk_dur = duration / n_parts
    parts = []

    for i in range(n_parts):
        part_path = mp3_path.parent / f"{mp3_path.stem}_part{i}.mp3"
        start = i * chunk_dur
        subprocess.run(
            [
                "ffmpeg", "-y", "-i", str(mp3_path),
                "-ss", str(start), "-t", str(chunk_dur),
                "-ac", "1", "-ar", "16000", "-b:a", "32k",
                str(part_path),
            ],
            capture_output=True,
        )
        parts.append((part_path, start))

    return parts


def transcribe_file(path):
    with open(path, "rb") as f:
        result = client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            response_format="verbose_json",
            timestamp_granularities=["segment"],
        )
    return result


def main():
    mp4s = sorted(LECTURE_DIR.glob("*.mp4"))
    print(f"Found {len(mp4s)} lecture videos\n")

    for mp4_path in mp4s:
        name = mp4_path.stem
        mp3_path = LECTURE_DIR / f"{name}.mp3"
        json_path = LECTURE_DIR / f"{name}.json"

        if json_path.exists():
            print(f"  Skipping {mp4_path.name} (transcript exists)")
            continue

        print(f"  Processing: {mp4_path.name}")

        print(f"    Extracting audio...")
        extract_audio(mp4_path, mp3_path)
        size_mb = mp3_path.stat().st_size / 1024 / 1024
        print(f"    Audio: {size_mb:.1f} MB")

        parts = split_audio(mp3_path)
        all_segments = []

        if isinstance(parts[0], tuple):
            print(f"    Split into {len(parts)} parts (file too large)")
            for part_path, offset in parts:
                print(f"    Transcribing part ({offset:.0f}s offset)...")
                result = transcribe_file(part_path)
                for s in result.segments:
                    seg = s if isinstance(s, dict) else {"text": s.text, "start": s.start, "end": s.end}
                    seg["start"] = seg["start"] + offset
                    seg["end"] = seg["end"] + offset
                    all_segments.append({"text": seg["text"], "start": seg["start"], "end": seg["end"]})
                part_path.unlink()
        else:
            print(f"    Transcribing...")
            result = transcribe_file(parts[0])
            for s in result.segments:
                if isinstance(s, dict):
                    all_segments.append({"text": s["text"], "start": s["start"], "end": s["end"]})
                else:
                    all_segments.append({"text": s.text, "start": s.start, "end": s.end})

        total_dur = all_segments[-1]["end"] if all_segments else 0

        with open(json_path, "w") as f:
            json.dump(
                {
                    "source_file": mp4_path.name,
                    "duration": total_dur,
                    "segments": all_segments,
                },
                f,
                indent=2,
            )

        mp3_path.unlink(missing_ok=True)

        mins = total_dur / 60
        print(f"    Done: {len(all_segments)} segments, {mins:.0f} min")
        print(f"    First: [{all_segments[0]['start']:.1f}s] {all_segments[0]['text'][:80]}")
        print()

    print("All lectures transcribed!")


if __name__ == "__main__":
    main()
