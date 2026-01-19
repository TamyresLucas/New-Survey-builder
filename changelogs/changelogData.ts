export const CHANGELOG_DATA = [
    {
        "date": "2026-01-19",
        "features": [
            "Add Shadcn token nomenclature to Survey Builder (47 tokens aligned with Design System)"
        ],
        "fixes": [
            "Update Email Address icon to Mail"
        ]
    },
    {
        "date": "2025-12-19",
        "features": [
            "Dark Mode Stress Test",
            "Update question types nomenclature and grouping"
        ],
        "fixes": [
            "replace hardcoded badge colors with success variant",
            "Update question types nomenclature and grouping"
        ]
    }
];

// Adapter for backward compatibility with AppChangelogModal
export const changelogs = CHANGELOG_DATA.map((entry, index) => ({
    id: `${entry.date}-${index}`,
    version: 'v1.0.x',
    date: entry.date,
    time: '12:00 PM',
    request: 'Updates for ' + entry.date,
    improvements: entry.features || [],
    technicalChanges: entry.fixes || []
}));