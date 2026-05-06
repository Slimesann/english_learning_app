import sys
import json
import os
import traceback

try:
    from faster_whisper import WhisperModel
except Exception as e:
    error_data = {"error": f"Import faster_whisper failed: {str(e)}"}
    print(json.dumps(error_data))
    print(f"Import error: {traceback.format_exc()}", file=sys.stderr)
    sys.exit(1)

import warnings
warnings.filterwarnings("ignore")

def main():
    if len(sys.argv) != 3:
        error_data = {"error": "Usage: script.py <audio> <output.json>"}
        print(json.dumps(error_data))  # STDOUT
        print(json.dumps(error_data), file=sys.stderr)
        sys.exit(1)

    audio_path, output_path = sys.argv[1], sys.argv[2]

    if not os.path.exists(audio_path):
        error_data = {"error": "File not found"}
        print(json.dumps(error_data))
        print(json.dumps(error_data), file=sys.stderr)
        sys.exit(1)

    try:
        print("[faster-whisper] Loading model...", file=sys.stderr)
        model = WhisperModel("base.en", device="cpu", compute_type="int8")

        print("[faster-whisper] Transcribing...", file=sys.stderr)
        segments, info = model.transcribe(audio_path, language="en", beam_size=5)

        seg_list = []
        full_text = ""
        for seg in segments:
            text = seg.text.strip()
            seg_list.append({
                "start": round(seg.start, 1),
                "end": round(seg.end, 1),
                "text": text
            })
            full_text += text + " "

        data = {
            "text": full_text.strip(),
            "segments": seg_list,
            "model": "base.en",
            "duration": round(info.duration, 1)
        }

        # GHI FILE
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        # IN RA STDOUT (QUAN TRỌNG!)
        print(json.dumps(data))
        print(f"[faster-whisper] Saved: {len(seg_list)} segments", file=sys.stderr)

    except Exception as e:
        error_msg = f"faster-whisper error: {str(e)}"
        error_data = {"error": error_msg}

        # GHI FILE LỖI
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(error_data, f)
        except:
            pass

        # IN RA STDOUT + STDERR
        print(json.dumps(error_data))
        print(error_msg, file=sys.stderr)
        print(traceback.format_exc(), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()