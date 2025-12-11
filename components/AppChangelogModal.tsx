import React, { useState, useMemo } from 'react';
import { changelogs } from '../changelogs/changelogData';
import { XIcon, SearchIcon, CalendarIcon, ChevronDownIcon } from './icons';

interface AppChangelogModalProps {
    onClose: () => void;
}

export const AppChangelogModal: React.FC<AppChangelogModalProps> = ({ onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDateRange, setSelectedDateRange] = useState('24h');
    const [selectedVersion, setSelectedVersion] = useState('');

    const currentVersion = changelogs[0]?.version || 'v1.0.0';

    const parseLogDate = (dateStr: string, timeStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return new Date(year, month - 1, day, hours, minutes);
    };

    const filteredLogs = useMemo(() => {
        return changelogs.filter(log => {
            const matchesSearch = log.request.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.improvements.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));

            let matchesDate = true;
            if (selectedDateRange !== 'all') {
                const logDate = parseLogDate(log.date, log.time);
                const now = new Date();
                const diff = now.getTime() - logDate.getTime();
                const hour = 60 * 60 * 1000;
                const day = 24 * hour;

                switch (selectedDateRange) {
                    case '24h': matchesDate = diff <= 24 * hour; break;
                    case '48h': matchesDate = diff <= 48 * hour; break;
                    case '7d': matchesDate = diff <= 7 * day; break;
                    case '30d': matchesDate = diff <= 30 * day; break;
                    case '90d': matchesDate = diff <= 90 * day; break;
                }
            }

            const matchesVersion = selectedVersion ? log.version === selectedVersion : true;
            return matchesSearch && matchesDate && matchesVersion;
        });
    }, [searchQuery, selectedDateRange, selectedVersion]);

    const availableVersions = useMemo(() => Array.from(new Set(changelogs.map(log => log.version))), []);

    const dateRanges = [
        { value: 'all', label: 'All Dates' },
        { value: '24h', label: 'Last 24 Hours' },
        { value: '48h', label: 'Last 48 Hours' },
        { value: '7d', label: 'Last Week' },
        { value: '30d', label: 'Last Month' },
        { value: '90d', label: 'Past 90 Days' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-surface w-full max-w-3xl max-h-[85vh] rounded-lg shadow-xl flex flex-col overflow-hidden border border-outline-variant">
                <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-white dark:bg-surface-container">
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-xl font-bold text-on-surface font-outfit">App Changelog</h2>
                        <span className="text-sm text-on-surface-variant font-mono">({currentVersion})</span>
                    </div>
                    <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container-lowest rounded-full transition-colors">
                        <XIcon className="text-xl" />
                    </button>
                </div>

                <div className="p-4 border-b border-outline-variant bg-white dark:bg-surface flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg" />
                        <input
                            type="text"
                            placeholder="Search changes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-surface-container-high border border-outline rounded-md text-sm text-on-surface hover:border-input-border-hover focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative min-w-[140px]">
                            <select
                                value={selectedVersion}
                                onChange={(e) => setSelectedVersion(e.target.value)}
                                className="w-full pl-3 pr-8 py-2 bg-white dark:bg-surface-container-high border border-outline rounded-md text-sm text-on-surface hover:border-input-border-hover focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer transition-all"
                            >
                                <option value="">All Versions</option>
                                {availableVersions.map(version => (
                                    <option key={version} value={version}>{version}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none" />
                        </div>
                        <div className="relative min-w-[140px]">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none" />
                            <select
                                value={selectedDateRange}
                                onChange={(e) => setSelectedDateRange(e.target.value)}
                                className="w-full pl-10 pr-8 py-2 bg-white dark:bg-surface-container-high border border-outline rounded-md text-sm text-on-surface hover:border-input-border-hover focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer transition-all"
                            >
                                {dateRanges.map(range => (
                                    <option key={range.value} value={range.value}>{range.label}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white dark:bg-surface-container-low">
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map(log => (
                            <div key={log.id} className="bg-white dark:bg-surface border border-outline-variant rounded-lg p-5 shadow-sm">
                                <div className="flex items-start justify-between mb-4 pb-3 border-b border-outline-variant/50">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-base font-semibold text-on-surface">{log.request}</h3>
                                            <span className="text-xs font-mono bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full">{log.version}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                                            <span className="flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded-full">
                                                <CalendarIcon className="text-xs" /> {log.date}
                                            </span>
                                            <span className="font-mono">{log.time}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Improvements</h4>
                                        <ul className="space-y-2">
                                            {log.improvements.map((imp, idx) => (
                                                <li key={idx} className="text-sm text-on-surface flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                                                    <span>{imp}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Technical Changes</h4>
                                        <ul className="space-y-2">
                                            {log.technicalChanges.map((tech, idx) => (
                                                <li key={idx} className="text-xs text-on-surface-variant font-mono bg-gray-50 dark:bg-surface-container p-2 rounded border border-outline-variant/50">
                                                    {tech}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-on-surface-variant">
                            <p>No changelogs found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
