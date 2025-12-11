import React, { useState } from 'react';
import type { Survey } from '../types';
import { XIcon, DownloadIcon } from './icons';
import { generateSurveyCsv } from '../utils';

interface SurveyExportProps {
    survey: Survey;
    onClose: () => void;
}

export const SurveyExport: React.FC<SurveyExportProps> = ({ survey, onClose }) => {
    // We can expand this with actual export settings (CSV, JSON, PDF, etc.)
    // For now, it provides the CSV download option.

    return (
        <div className="fixed inset-0 z-50">
            <div className="bg-surface w-full h-full flex flex-col">
                <header className="p-4 border-b border-outline-variant flex items-center justify-between flex-shrink-0 bg-surface-container">
                    <h2 className="text-lg font-bold text-on-surface">Export Survey</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-lowest">
                        <XIcon className="text-xl" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-8 bg-surface-container flex justify-center">
                    <div className="max-w-2xl w-full">
                        <div className="bg-surface p-6 rounded-lg shadow-sm border border-outline-variant">
                            <h3 className="text-xl font-semibold mb-4 text-on-surface">Export Options</h3>

                            <div className="space-y-4">
                                <div className="p-4 border border-outline rounded-md flex items-center justify-between hover:border-primary transition-colors cursor-pointer"
                                    onClick={() => {
                                        const csvContent = generateSurveyCsv(survey);
                                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                        const link = document.createElement('a');
                                        if (link.download !== undefined) {
                                            const url = URL.createObjectURL(blob);
                                            link.setAttribute('href', url);
                                            link.setAttribute('download', `${survey.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.csv`);
                                            link.style.visibility = 'hidden';
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-full">
                                            <DownloadIcon className="text-primary text-xl" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-on-surface">Export as CSV</h4>
                                            <p className="text-sm text-on-surface-variant">Download survey structure in CSV format</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-primary text-on-primary rounded-md font-semibold text-sm">
                                        Download
                                    </button>
                                </div>

                                {/* Placeholder for other export types */}
                                <div className="p-4 border border-outline rounded-md flex items-center justify-between opacity-50 cursor-not-allowed">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-surface-variant p-2 rounded-full">
                                            <span className="font-bold text-on-surface-variant text-lg px-1">PDF</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-on-surface">Export as PDF</h4>
                                            <p className="text-sm text-on-surface-variant">Coming soon</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border border-outline rounded-md flex items-center justify-between opacity-50 cursor-not-allowed">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-surface-variant p-2 rounded-full">
                                            <span className="font-bold text-on-surface-variant text-lg px-1">{`{ }`}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-on-surface">Export as JSON</h4>
                                            <p className="text-sm text-on-surface-variant">Coming soon</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
