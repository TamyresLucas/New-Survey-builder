import type { Meta, StoryObj } from '@storybook/react';
import React, { useEffect, useState } from 'react';

const ThemeDebug = () => {
    const [themeClass, setThemeClass] = useState('');
    const [computedBg, setComputedBg] = useState('');

    useEffect(() => {
        // Function to update state
        const updateDebugInfo = () => {
            const html = document.documentElement;
            setThemeClass(html.className);
            setComputedBg(getComputedStyle(document.body).getPropertyValue('--background'));
        };

        // Initial check
        updateDebugInfo();

        // Observer to watch for class changes on html
        const observer = new MutationObserver(updateDebugInfo);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="p-4 border rounded-lg shadow-sm bg-card text-card-foreground">
            <h3 className="text-lg font-bold mb-4">Dark Mode Debugger</h3>

            <div className="space-y-2">
                <div className="flex justify-between p-2 border rounded bg-muted">
                    <span className="font-semibold">HTML Class:</span>
                    <code className="bg-background px-1 rounded">"{themeClass}"</code>
                </div>

                <div className="flex justify-between p-2 border rounded bg-muted">
                    <span className="font-semibold">Body --background:</span>
                    <code className="bg-background px-1 rounded">{computedBg}</code>
                </div>

                <div className="p-4 mt-4 text-center border rounded">
                    This box should be white in Light mode and dark grey in Dark mode.<br />
                    (If this text is white on white, dark mode variables are active but background is wrong!)
                </div>
            </div>
        </div>
    );
};

const meta: Meta<typeof ThemeDebug> = {
    title: 'Design Tokens/Theme Debug',
    component: ThemeDebug,
};

export default meta;

type Story = StoryObj<typeof ThemeDebug>;

export const Default: Story = {};
