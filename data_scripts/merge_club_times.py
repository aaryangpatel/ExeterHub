"""
Merge time and location data into clubs.json.
Maps user-provided club names to clubs.json names (handling variations).
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CLUBS_PATH = ROOT / "data" / "clubs.json"

# User data: Club Name -> (Day, Time, Room, Building)
# For clubs with multiple meetings, we combine them
TIME_LOCATION_DATA = """
A(rt): More Possibilities in STEAM,Tuesday,7:00 PM to 7:50 PM,Room 211,Phillips Hall
Academy Book Club,Saturday,1:00 PM to 2:00 PM,Room 219,EPAC
African Student Association,Tuesday,7:00 PM to 7:50 PM,Club Room B (201),EPAC
Afro-Latinx Society,Friday,7:00 PM to 7:50 PM,Club Room B (201),EPAC
Anime Club,Saturday,4:00 PM to 5:00 PM,TV Room (023),EPAC
Arabic Club,Sunday,11:00 PM to 12:00 PM,Student Activities Office (210),EPAC
Archaeology club,Tuesday,6:00 PM to 7:00 PM,Room 319,EPAC
Architecture Club,Sunday,5:00 PM to 6:00 PM,Arts & Crafts Room (001),EPAC
ART Club,Tuesday,7:00 PM to 7:50 PM,Arts & Crafts Room (001),EPAC
Asian Voices,Tuesday,6:15 PM to 7:00 PM,Gilman House - Gillespie Room,Gilman House
Astronomy Club,Friday,7:00 PM to 8:30 PM,Room 319,EPAC
Association for Low Income Exonians,Tuesday,7:00 PM to 7:50 PM,Third floor,J-Smith Hall
Athletes for Racial Justice,Tuesday,7:00 PM to 7:50 PM,Club Room B (201),EPAC
Aviation Club,Sunday,7:00 PM to 7:50 PM,Room 319,EPAC
Badminton Club,Sunday,3:00 PM to 5:00 PM,Thompson Gym (Gym),Love Gym
Biology Club,Sunday,3:00 PM to 4:00 PM,Room 316,EPAC
Black Students of Excellence,Thursday,7:00 PM to 7:50 PM,Forum (321),EPAC
Board Game Alliance,Saturday,5:00 PM to 7:00 PM,Arts & Crafts Room (001),EPAC
Bridge and Card Games Club,Wednesday,7:00 PM to 7:50 PM,Basement Center Commons,EPAC
Buddhist Meditation,Sunday,2:00 PM to 3:00 PM,Wicks Room,Phillips Church
Catholic Exonians,Monday,7:00 PM to 7:50 PM,Wicks Room,Phillips Church
Catholic Exonians,Sunday,10:00 PM to 11:00 PM,St. Michael's Church,Off Campus
Chemistry Club,Sunday,4:00 PM to 5:00 PM,Room 214,Phelps Science Building
Chess Club,Friday,8:00 PM to 10:00 PM,Arts & Crafts Room (001),EPAC
Chinese Language Society,Wednesday,7:00 PM to 7:50 PM,Kitchen (022),EPAC
Chinese Student Organization,Tuesday,6:15 PM to 7:00 PM,New Dining Hall - upstairs,Hahn Center
Christian Fellowship,Wednesday,6:30 PM to 7:50 PM,Basement,Phillips Church
Clan na Gael,Sunday,12:00 PM to 1:00 PM,Student Activities Office (210),EPAC
Climate Lobby AND Sunrise,Wednesday,7:00 PM to 7:50 PM,Room 219,EPAC
Cooking Club/Baking Club,Sunday,4:00 PM to 6:00 PM,Kitchen (022),EPAC
Cubing Exeter,Friday,8:00 PM to 9:00 PM,Room 219,EPAC
Debate,Tuesday,7:00 PM to 7:50 PM,Grainger Auditorium & Forum (321),Phelps Science Building/EPAC
Debate,Wednesday,1:00 PM to 3:30 PM,Grainger Auditorium & Sinha Conference Room,Phelps Science Building
Democratic Club,Monday,7:00 PM to 7:50 PM,Sinha Conference Room,Phelps Science Building
Digital Music Making,Saturday,1:00 PM to 2:00 PM,Forrestal-Bowld Music Round Room,Music Building
DJ Club,Sunday,7:00 PM to 7:50 PM,Arts & Crafts Room (001),EPAC
DON at PEA,Tuesday,6:00 PM to 7:00 PM,Elm Street Table,Elm Street Dining Hall
DOS(e),Sunday,7:00 PM to 7:50 PM,Room 219,EPAC
Dungeons and Dragons Club,Saturday,2:00 PM to 5:00 PM,Arts & Crafts Room (001),EPAC
EAC and E-Proctors,Wednesday,6:00 PM to 7:00 PM,Room 319,EPAC
Economics Club,Monday,7:00 PM to 7:50 PM,Forum (321),EPAC
Engineering Club,Sunday,3:00 PM to 4:00 PM,Makers Lab/Design Lab,Phelps Science Building
Entrepreneurship Club,Thursday,6:00 PM to 7:00 PM,Room 319,EPAC
Ethics Forum,Tuesday,6:00 PM to 7:00 PM,New Dining Hall Table,New Dining Hall
Exeter Business Club,Sunday,2:00 PM to 4:00 PM,Forum (321),EPAC
Exeter Computing Club,Sunday,4:00 PM to 5:00 PM,Room 123,Phelps Science Building
Exeter Film Club,Friday,7:30 PM to 10:00 PM,Forum (321),EPAC
Exeter Fishing,Sunday,2:30 PM to 3:30 PM,Room 319,EPAC
Exeter Investment Society,Monday,6:00 PM to 7:00 PM,Forum (321),EPAC
Exeter Jewelry Making,Friday,7:00 PM to 7:50 PM,Room 219,EPAC
Exeter Jewish Community (EJC),Friday,6:00 PM to 7:00 PM,Basement,Phillips Church
Exeter Legal Society,Wednesday,6:00 PM to 7:00 PM,Arts & Crafts Room (001),EPAC
Exeter Pinoy Society,Tuesday,6:00 PM to 7:00 PM,Club Room A (221),EPAC
Exeter Political Union,Sunday,2:00 PM to 3:00 PM,Room 219,EPAC
Exeter Research Club,Monday,7:00 PM to 7:50 PM,Arts & Crafts Room (001),EPAC
Exeter Review,Thursday,6:00 PM to 7:00 PM,Room 219,EPAC
Exeter Rocketry Club,Sunday,1:00 PM to 2:00 PM,Makers Lab/Design Lab,Phelps Science Building
Exeter Sewing Society,Wednesday,1:00 PM to 3:30 PM,Makers Lab/Design Lab,Phelps Science Building
Exeter Socialist Union,Sunday,11:00 PM to 12:00 PM,Kitchen (022),EPAC
Exeter Sports Analytics Club,Sunday,12:00 PM to 1:00 PM,Room 219,EPAC
EXIE Blog,Sunday,11:00 PM to 12:00 PM,Elm Street Table,Elm Street Dining Hall
Exonian Board,Tuesday,7:00 PM to 7:50 PM,Forum (321),EPAC
Exonian Business Board,Thursday,7:00 PM to 7:50 PM,Kitchen (022),EPAC
Exonian Web Board,Thursday,6:15 PM to 7:00 PM,Exonian Room (216),EPAC
Exonian Writer's Meeting,Sunday,7:00 PM to 7:50 PM,Forum (321),EPAC
Exonians Against Sexual Assault (EASA),Monday,7:00 PM to 7:50 PM,Room 219,EPAC
Exonians for Nuclear Disarmament,Wednesday,7:00 PM to 7:50 PM,Arts & Crafts Room (001),EPAC
Exonians with Disabilities Association (EDA),Tuesday,7:00 PM to 7:50 PM,Room 007,New Hall
Fans of Football Club,Sunday,4:00 PM to 5:00 PM,TV Room (023),EPAC
Females for Finance,Monday,7:00 PM to 7:50 PM,TV Room (023),EPAC
Feminist Union,Wednesday,7:00 PM to 7:50 PM,TV Room (023),EPAC
Fencing Club,Sunday,12:00 PM to 1:00 PM,Thompson Gym (Gym),Love Gym
Fight Club,Wednesday,7:00 PM to 7:50 PM,Room 011,New Hall
Game Development Club,Sunday,4:00 PM to 5:00 PM,Room 319,EPAC
Gender & Sexuality Alliance (GSA),Tuesday,7:00 PM to 7:50 PM,GSA Room (202),EPAC
Genetics and Biotech Club,Friday,6:00 PM to 7:00 PM,Room 219,EPAC
Geography Club,Sunday,6:00 PM to 7:00 PM,Elm Street Dining - Table,Elm Street Dining Hall
German Club,Wednesday,5:30 PM to 7:00 PM,Kitchen (022),EPAC
Girl Talk,Sunday,1:00 PM to 2:00 PM,TV Room (023),EPAC
Girls in Sport,Tuesday,7:00 PM to 7:50 PM,TV Room (023),EPAC
Girls Who Lift,Sunday,5:00 PM to 6:00 PM,Downer Family Fitness Room,Love Gym
Ham Radio,Saturday,2:00 PM to 3:00 PM,Room 319,EPAC
Hindu Society,Saturday,1:00 PM to 2:00 PM,Room 319,EPAC
Hong Kong Society,Thursday,6:00 PM to 6:45 PM,Elm Street Table,Elm Street Dining Hall
Improv Club,Wednesday,7:00 PM to 7:50 PM,Forum (321),EPAC
Indigenous Culture Club,Wednesday,6:00 PM to 7:00 PM,Elm Street Table,Elm Street Dining Hall
International Student Alliance,Tuesday,6:00 PM to 7:00 PM,Room 316,EPAC
International Student Alliance Board,Wednesday,12:45 PM - 1:30 PM,Office Of Multicultural Affairs,J-Smith Hall
Italian Club,Thursday,7:00 PM to 7:50 PM,TV Room (023),EPAC
Kirtland Society,Friday,7:00 PM to 7:50 PM,Gilman House - Gillespie Room,Gilman House
Korean Society,Monday,6:15 PM to 7:00 PM,Gilman House - Gillespie Room,Gilman House
La Alianza Latina,Thursday,7:00 PM to 7:50 PM,Club Room B (201),EPAC
Language Learning Club/Philoglottic Society,Thursday,7:00 PM to 7:50 PM,Arts & Crafts Room (001),EPAC
Lego Club,Sunday,1:00 PM to 2:00 PM,Kitchen (022),EPAC
Liber,Tuesday,12:40 PM to 1:30 PM,Room 263,Music Building
Linguistics Society,Sunday,6:00 PM to 7:00 PM,Room 219,EPAC
Matter Magazine,Sunday,5:00 PM to 6:00 PM,Room 316,EPAC
Medical Anthropology,Monday,6:00 PM to 7:00 PM,Room 219,EPAC
Men's Mental Health Club,Sunday,4:00 PM to 5:00 PM,Room 219,EPAC
Middle Eastern and North African Society (MENAS),Monday,7:00 PM to 7:50 PM,Kitchen (022),EPAC
Model UN,Sunday,1:00 PM to 2:00 PM,Forum (321),EPAC
Model UN,Wednesday,6:00 PM to 7:00 PM,Forum (321),EPAC
Multi-Racial Exonian Society,Wednesday,7:00 PM to 7:50 PM,Room 319,EPAC
Music Writing Club,Saturday,5:00 PM to 6:00 PM,Forrestal-Bowld Music Round Room,Music Building
Muslim Student Association - Jummah Prayers,Friday,12:45 PM - 1:30 PM,Wicks Room,Phillips Church
Nail Club,Friday,6:00 PM to 8:00 PM,Arts & Crafts Room (001),EPAC
Neuroscience Club,Sunday,6:00 PM to 7:00 PM,Room 316,EPAC
Ocean Awareness and Action,Monday,12:45 PM - 1:30 PM,Room 219,EPAC
Origami Club,Sunday,1:00 PM to 2:00 PM,Arts & Crafts Room (001),EPAC
PEAN,Tuesday,6:00 PM to 7:00 PM,Room 219,EPAC
PEAN,Tuesday,7:00 PM to 7:50 PM,Room 219,EPAC
peAnimators,Thursday,7:00 PM to 7:50 PM,Room 316,EPAC
Pendulum,Sunday,10:00 AM to 11:00 AM,Elm Street Table,Elm Street Dining Hall
Philosophy Club,Sunday,5:00 PM to 6:00 PM,Elm Street Table,Elm Street Dining Hall
Photography Club,Sunday,12:00 PM to 1:00 PM,Room 316,EPAC
Physics Club Competition Group,Saturday,2:00 PM to 4:00 PM,Room 318,Phelps Science Building
Physics Club Lecture Group,Friday,7:00 PM to 8:00 PM,Room 318,Phelps Science Building
Private Equity and Venture Capital Club,Sunday,1:00 PM to 2:00 PM,Room 219,EPAC
Psychology Club,Sunday,12:00 PM to 1:00 PM,Room 319,EPAC
Racing Club,Sunday,4:00 PM to 6:00 PM,Forum (321),EPAC
Real Estate Club,Sunday,1:00 PM to 2:00 PM,Room 319,EPAC
Red Runners,Sunday,4:30 PM to 6:00 PM,Track/Academy Woods (Outside),Outside
Reel Life Productions,Sunday,1:00 PM to 2:00 PM,Room 316,EPAC
Republican Club,Thursday,6:00 PM to 7:00 PM,Arts & Crafts Room (001),EPAC
Robotics Club,Sunday,2:00 PM to 3:00 PM,Makers Lab/Design Lab,Phelps Science Building
Robotics Club,Wednesday,6:00 PM to 7:00 PM,Makers Lab/Design Lab,Phelps Science Building
Robotics Club - VERTEX,Sunday,12:00 PM to 1:00 PM,Forum (321),EPAC
Science Bowl Club,Tuesday,7:00 PM to 7:50 PM,Room 319,EPAC
Science Olympiad,Saturday,11:00 PM to 12:00 PM,Room 319,EPAC
Secular Society,Tuesday,7:00 PM to 7:50 PM,Stuckey Room,Phillips Church
Self Care Club,Monday,7:00 PM to 7:50 PM,Room 319,EPAC
SOCAA,Sunday,5:00 PM to 7:00 PM,Kitchen (022),EPAC
Sports Statistics,Sunday,2:00 PM to 3:00 PM,Room 316,EPAC
Student Francophonie Coalition,Sunday,3:00 PM to 4:00 PM,Kitchen (022),EPAC
Subcontinent Society,Thursday,7:00 PM to 7:50 PM,Club Room A (221),EPAC
Taiwan Society,Thursday,6:00 PM to 6:45 PM,Elm Street Table,Elm Street Dining Hall
Thai Club,Friday,6:00 PM to 7:00 PM,TV Room (023),EPAC
The Asian Magazine,Sunday,2:00 PM to 3:00 PM,Club Room A (221),EPAC
Triathlon Club,Sunday,10:00 PM to 11:00 PM,Track Ransome Room & Pool (GYM),Love Gym
UNITE,Sunday,2:00 PM to 3:00 PM,TV Room (023),EPAC
Vietnamese Society,Friday,6:00 PM to 7:00 PM,Kitchen (022),EPAC
WEVision,Thursday,6:00 PM to 7:00 PM,Room 316,EPAC
WORD,Thursday,6:30 PM to 7:30 PM,Room 106,Phillips Hall
WPEA Board Meeting,Tuesday,7:00 PM to 7:50 PM,Kitchen (022),EPAC
Young Brothers Society (YBS),Monday,7:00 PM to 7:50 PM,Club Room B (201),EPAC
Young Sisters Society,Monday,7:00 PM to 7:50 PM,GSA Room (202),EPAC
""".strip()

# Map user-provided names to clubs.json names (for variations)
NAME_ALIASES = {
    "Academy Book Club": "ABC: Academy Book Club",
    "Afro-Latinx Society": "Afro-Latinx Exonian Society (ALES)",
    "Anime Club": "Anime Exeter",
    "Archaeology club": "Archaeology Club",
    "ART Club": "Art Club",
    "Association for Low Income Exonians": "Association of Low Income Exonians (ALIE)",
    "Athletes for Racial Justice": "Athletes for Racial Justice (ARJ)",
    "Board Game Alliance": "Exeter Board Game Alliance",
    "Chinese Student Organization": "Chinese Student Organization (CSO)",
    "Climate Lobby AND Sunrise": "Exeter Climate Lobby",  # Also Sunrise Exeter - use first
    "Cooking Club/Baking Club": "Culinary Club - Cooking and Baking",
    "Cubing Exeter": "CubingEXETER",
    "Debate": "Daniel Webster Debate Society",
    "Digital Music Making": "Digital Music Making (Formerly Electronic Music Club)",
    "DON at PEA": "Diversify Our Narrative @ PEA",
    "DOS(e)": "Democracy of Sound (Exeter)",
    "EAC and E-Proctors": "Environmental Action Committee",  # Or Environmental Proctors
    "Economics Club": "Exeter Economics Association",
    "Exeter Fishing": "Exeter Fishing Club",
    "Exeter Jewelry Making": "Exeter Jewelry Making Association",
    "Exeter Jewish Community (EJC)": "Exeter Jewish Community",
    "Exeter Legal Society": "Legal Society",
    "Exeter Review": "The Exeter Review",
    "Exeter Rocketry Club": "Exeter Rocket Team",
    "EXIE Blog": "Exie Blog",
    "Exonian Board": "The Exonian",
    "Exonian Business Board": "The Exonian Business Board",
    "Exonian Web Board": "The Exonian Web Board",
    "Exonian Writer's Meeting": "The Exeter Review",  # Or separate - using Review
    "Exonians for Nuclear Disarmament": "Exonians for Nuclear Disarmament (END)",
    "Fans of Football Club": "Fans of Football",
    "Females for Finance": "Females for Finance",
    "Game Development Club": "Game Dev Club",
    "Gender & Sexuality Alliance (GSA)": "Gender & Sexuality Alliance (GSA)",  # Not in clubs.json
    "Improv Club": "Exeter Improv",
    "Girl Talk": "Girl Talk: Advocacy for Self Care",
    "Ham Radio": "Ham Radio Club",
    "Language Learning Club/Philoglottic Society": "Philoglottic Society (formerly Language Learning Club)",
    "Lego Club": "Academy Band of Lego Builders",
    "Matter Magazine": "MATTER Magazine",
    "Medical Anthropology": "Medical Anthropology Club",
    "Middle Eastern and North African Society (MENAS)": "Middle Eastern and North African Society",
    "Model UN": "Model United Nations",
    "Multi-Racial Exonian Society": "Multiracial Exonian Society (MRES)",
    "Muslim Student Association - Jummah Prayers": "Muslim Student Association",
    "Nail Club": "Exeter Nails",
    "Ocean Awareness and Action": "Ocean Awareness and Action Club",
    "peAnimators": "peAnimation",
    "Physics Club Competition Group": "Physics Club",
    "Physics Club Lecture Group": "Physics Club",
    "Private Equity and Venture Capital Club": "Exeter Private Equity and Venture Capital Club",
    "Racing Club": "Exeter Racing Club",
    "Robotics Club - VERTEX": "VERTEX Robotics Group",
    "Science Bowl Club": "Science Bowl",
    "Sports Statistics": "Sports Statistics Club",
    "Student Francophonie Coalition": "French Cultural Club",  # Or separate
    "Triathlon Club": "Exeter Triathlon Club",
    "UNITE": "Unite Coalition and Publication",
    "WEVision": "WEVision x PEA",
    "WORD": "Word",
    "WPEA Board Meeting": "WPEA",
    "Young Brothers Society (YBS)": "Young Brothers Society",
}


def parse_data() -> dict[str, list[tuple[str, str, str, str]]]:
    """Parse TIME_LOCATION_DATA into club -> list of (day, time, room, building)."""
    result: dict[str, list[tuple[str, str, str, str]]] = {}
    for line in TIME_LOCATION_DATA.split("\n"):
        if not line.strip():
            continue
        parts = [p.strip() for p in line.split(",")]
        if len(parts) < 5:
            continue
        club, day, time, room, building = parts[0], parts[1], parts[2], parts[3], parts[4]
        target = NAME_ALIASES.get(club, club)
        if target not in result:
            result[target] = []
        result[target].append((day, time, room, building))
    return result


def format_times(meetings: list[tuple[str, str, str, str]]) -> str:
    """Combine multiple meetings into a single string."""
    parts = [f"{day}, {time}" for day, time, _, _ in meetings]
    return "; ".join(parts)


def format_location(meetings: list[tuple[str, str, str, str]]) -> str:
    """Combine locations; if same, use once; if different, join."""
    locs = set()
    for _, _, room, building in meetings:
        locs.add(f"{room}, {building}")
    return "; ".join(sorted(locs))


def main() -> None:
    data = parse_data()
    # "Climate Lobby AND Sunrise" - both clubs meet together
    if "Exeter Climate Lobby" in data:
        data["Sunrise Exeter"] = data["Exeter Climate Lobby"]

    with open(CLUBS_PATH, encoding="utf-8") as f:
        clubs = json.load(f)

    club_map = {c["club"]: c for c in clubs}
    updated = 0

    for source_name, meetings in data.items():
        target = club_map.get(source_name)
        if target is None:
            # Try case-insensitive or partial match
            for key in club_map:
                if key.lower() == source_name.lower():
                    target = club_map[key]
                    break
                if source_name.lower() in key.lower() or key.lower() in source_name.lower():
                    target = club_map[key]
                    break
        if target is not None:
            target["times"] = format_times(meetings)
            target["location"] = format_location(meetings)
            updated += 1
        else:
            print(f"  No match for: {source_name}")

    with open(CLUBS_PATH, "w", encoding="utf-8") as f:
        json.dump(clubs, f, indent=2)

    print(f"Updated {updated} clubs with time/location data")


if __name__ == "__main__":
    main()
