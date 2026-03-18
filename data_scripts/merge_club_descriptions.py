"""
Merge club descriptions into clubs.json.
Reads from club_descriptions.json and updates the description field.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CLUBS_PATH = ROOT / "data" / "clubs.json"
DESCRIPTIONS_PATH = ROOT / "scripts" / "club_descriptions.json"

# Map user-provided names to clubs.json names (for variations)
NAME_ALIASES = {
    "Academy Band of Lego Builders": "Academy Band of Lego Builders",
    "Culinary Club - Cooking and Baking": "Culinary Club - Cooking and Baking",
}


def main() -> None:
    with open(DESCRIPTIONS_PATH, encoding="utf-8") as f:
        descriptions = json.load(f)

    with open(CLUBS_PATH, encoding="utf-8") as f:
        clubs = json.load(f)

    club_map = {c["club"]: c for c in clubs}
    updated = 0

    for source_name, desc in descriptions.items():
        if not desc or not desc.strip():
            continue
        target = club_map.get(source_name)
        if target is not None:
            target["description"] = desc.strip()
            updated += 1
        else:
            for key in club_map:
                if key.lower() == source_name.lower():
                    club_map[key]["description"] = desc.strip()
                    updated += 1
                    break
                if source_name.lower() in key.lower() or key.lower() in source_name.lower():
                    club_map[key]["description"] = desc.strip()
                    updated += 1
                    break

    with open(CLUBS_PATH, "w", encoding="utf-8") as f:
        json.dump(clubs, f, indent=2)

    print(f"Updated {updated} clubs with descriptions")


if __name__ == "__main__":
    main()
