
"""
Central project registry for the portfolio API.
"""

PROJECTS = [
    {
        "id": 1,
        "slug": "nightowltab",
        "title": "NightOwlTab",
        "category": "Software Development",
        "description": (
            "An open-source tournament management and "
            "tabulation platform designed to make competitive "
            "debating infrastructure more accessible."
        ),
        "technologies": [
            "Python",
            "FastAPI",
            "SQLite",
        ],
        "status": "Ideation and Architecture",
    },
    {
        "id": 2,
        "slug": "environmental-monitoring",
        "title": "Environmental Monitoring System",
        "category": "Embedded Systems",
        "description": (
            "An ESP32-based environmental monitoring prototype "
            "integrating temperature, pH, turbidity, and TDS sensors."
        ),
        "technologies": [
            "ESP32",
            "Embedded C",
            "Sensors",
            "Electronics",
        ],
        "status": "Prototype",
    },
    {
        "id": 3,
        "slug": "spin-to-win",
        "title": "Spin to Win",
        "category": "Game Development",
        "description": (
            "A slot-machine-inspired game developed in Godot "
            "for a game jam, featuring three reels and a "
            "credit-based gameplay system."
        ),
        "technologies": [
            "Godot",
            "GDScript",
            "Game Development",
        ],
        "status": "Game Jam Project",
    },
]
