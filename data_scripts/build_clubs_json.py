"""
Build clubs.json from clubleaders.csv.
Groups leaders per club and outputs JSON with club, description, times, location, leaders.
"""

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = ROOT / "clubleaders.csv"
OUT_PATH = ROOT / "data" / "clubs.json"


def main() -> None:
    clubs: dict[str, list[str]] = {}

    with open(CSV_PATH, encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            club = row["Club"].strip()
            leader = f"{row['First Name']} {row['Last Name']}".strip()
            if club not in clubs:
                clubs[club] = []
            clubs[club].append(leader)

    output = []
    for club, leaders in sorted(clubs.items()):
        output.append({
            "club": club,
            "description": "",
            "times": "",
            "location": "",
            "leaders": leaders,
        })

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    print(f"Wrote {len(output)} clubs to {OUT_PATH}")


if __name__ == "__main__":
    main()
