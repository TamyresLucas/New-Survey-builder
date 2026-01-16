import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TokenData {
    token: string;
    variable: string;
    usage: string;
}

const tokens: TokenData[] = [
    { token: 'background', variable: '--background', usage: 'Main page background color' },
    { token: 'foreground', variable: '--foreground', usage: 'Main text color for body content' },
    { token: 'card', variable: '--card', usage: 'Background for card containers and elevated surfaces' },
    { token: 'card-foreground', variable: '--card-foreground', usage: 'Text color for content inside cards' },
    { token: 'popover', variable: '--popover', usage: 'Background for popovers, dropdowns, and floating menus' },
    { token: 'popover-foreground', variable: '--popover-foreground', usage: 'Text color for content inside popovers' },
    { token: 'primary', variable: '--primary', usage: 'Primary action buttons and main interactive elements' },
    { token: 'primary-foreground', variable: '--primary-foreground', usage: 'Text color on primary-colored backgrounds' },
    { token: 'secondary', variable: '--secondary', usage: 'Secondary buttons and less prominent interactive elements' },
    { token: 'secondary-foreground', variable: '--secondary-foreground', usage: 'Text color on secondary-colored backgrounds' },
    { token: 'muted', variable: '--muted', usage: 'Subtle backgrounds for muted content and disabled states' },
    { token: 'muted-foreground', variable: '--muted-foreground', usage: 'Text color for muted, de-emphasized, or secondary content' },
    { token: 'accent', variable: '--accent', usage: 'Accent backgrounds for highlights and hover states' },
    { token: 'accent-foreground', variable: '--accent-foreground', usage: 'Text color on accent-colored backgrounds' },
    { token: 'destructive', variable: '--destructive', usage: 'Error states, delete buttons, and dangerous actions' },
    { token: 'destructive-foreground', variable: '--destructive-foreground', usage: 'Text color on destructive-colored backgrounds' },
    { token: 'success', variable: '--success', usage: 'Success states and positive actions' },
    { token: 'success-foreground', variable: '--success-foreground', usage: 'Text color on success backgrounds' },
    { token: 'warning', variable: '--warning', usage: 'Warning states and caution messages' },
    { token: 'warning-foreground', variable: '--warning-foreground', usage: 'Text color on warning backgrounds' },
    { token: 'info', variable: '--info', usage: 'Informational messages' },
    { token: 'info-foreground', variable: '--info-foreground', usage: 'Text color on info backgrounds' },
    { token: 'border', variable: '--border', usage: 'Border color for dividers and component outlines' },
    { token: 'input', variable: '--input', usage: 'Border color specifically for input fields' },
    { token: 'ring', variable: '--ring', usage: 'Focus ring color for keyboard navigation and accessibility' },
];

const TokenRow = ({ data }: { data: TokenData }) => {
    const [lightValue, setLightValue] = useState('');
    const [darkValue, setDarkValue] = useState('');

    useEffect(() => {
        // Helper to get variable value
        const getVar = (element: Element, variable: string) => {
            const val = getComputedStyle(element).getPropertyValue(variable).trim();
            return val || '-';
        };

        // 1. Get Light Value (from documentElement, assuming it's default or forcefully light)
        // Actually, documentElement might be dark if toggle is On.
        // To be safe, we should create specific container contexts.

        const resolveValues = () => {
            const tempLight = document.createElement('div');
            // Ensure no dark class, but also need to make sure it's not nested in a dark parent?
            // CSS variables cascade. 
            // Shadcn uses .dark class. Light is default (root).
            // If we are in dark mode, root has .dark.
            // So to get light values, we might need to remove .dark temporarily or assume root without .dark is light.
            // BUT we can't easily isolate "Light Mode" if the whole page is Dark.
            // However, we can look at the raw stylesheets? No, too complex.
            // We can create an iframe? Heavy.

            // Better approach:
            // Shadcn defines variables in :root { ... } and .dark { ... }
            // If we are in Light mode (<i>no .dark class on html</i>):
            //   :root gives Light.
            //   .dark element gives Dark.
            // If we are in Dark mode (<i>.dark class on html</i>):
            //   :root gives Light (technically, unless overridden by .dark selector spec).
            //   Wait. .dark is a class. :root is a pseudo-class.
            //   .dark variables inside .dark { ... } override :root.
            //   Variables defined in :root apply everywhere.
            //   Variables defined in .dark apply to elements with .dark.

            // So:
            // Light Value: Always on :root (assuming standard Shadcn setup where base vars are in :root).
            // BUT if we are inside <html class="dark">, getComputedStyle(documentElement) returns the *winning* value (Dark).
            // Example: --background in :root is white. In .dark is black.
            // In dark mode, getComputedStyle returns black.

            // To get the Light value while in Dark mode:
            // We need an element that is NOT inside .dark.
            // But body is inside html.dark.
            // We can't escape the html class easily if we are rendering in the DOM.

            // Workaround: Use a hidden iframe? Or assume standard values?
            // Or simply accept that "Light Mode" column might show correct values ONLY when we are in Light mode?
            // No, user wants a "Reference Table".

            // Let's try to fetch values from a clean context.
            // Using an iframe is the most robust way to escape inherited styles.

            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            // Inside iframe (default light):
            // We need to inject the CSS? 
            // The CSS is loaded in the main document. We'd need to copy it.
            // That's tricky.

            // Alternative: Parse the document.styleSheets?
            // Iterate over rules.
            // Find :root rule. Find .dark rule.
            // This is fast and synchronous.

            let lVal = '';
            let dVal = '';

            for (const sheet of Array.from(document.styleSheets)) {
                try {
                    for (const rule of Array.from(sheet.cssRules)) {
                        if (rule instanceof CSSStyleRule) {
                            if (rule.selectorText === ':root') {
                                const v = rule.style.getPropertyValue(data.variable).trim();
                                if (v) lVal = v;
                            }
                            if (rule.selectorText === '.dark') {
                                const v = rule.style.getPropertyValue(data.variable).trim();
                                if (v) dVal = v;
                            }
                        }
                    }
                } catch (e) {
                    // Security warnings for cross-origin sheets
                }
            }

            setLightValue(lVal || 'Not found');
            setDarkValue(dVal || 'Not found');

            document.body.removeChild(iframe);
        };

        resolveValues();
    }, [data.variable]);

    return (
        <tr className="table-body-row">
            <td className="p-2 font-mono text-sm font-bold">{data.token}</td>
            <td className="p-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: `hsl(${lightValue})` }}></div>
                    {lightValue}
                </div>
            </td>
            <td className="p-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: `hsl(${darkValue})` }}></div>
                    {darkValue}
                </div>
            </td>
            <td className="p-2 text-sm text-muted-foreground">{data.usage}</td>
        </tr>
    );
};

export const TokenUsageTable = () => {
    return (
        <div className="w-full overflow-auto my-8">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="table-header-row">
                        <th className="p-2 font-medium">Token</th>
                        <th className="p-2 font-medium">Light Mode (HSL)</th>
                        <th className="p-2 font-medium">Dark Mode (HSL)</th>
                        <th className="p-2 font-medium">Usage</th>
                    </tr>
                </thead>
                <tbody>
                    {tokens.map(t => <TokenRow key={t.token} data={t} />)}
                </tbody>
            </table>
        </div>
    );
};
