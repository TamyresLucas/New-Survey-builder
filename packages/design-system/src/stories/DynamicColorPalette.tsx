import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ColorToken {
    name: string;
    variable: string;
    className: string;
}

interface ColorGroup {
    title: string;
    tokens: ColorToken[];
}

const groups: ColorGroup[] = [
    {
        title: 'Base Colors',
        tokens: [
            { name: 'Background', variable: '--background', className: 'bg-background' },
            { name: 'Foreground', variable: '--foreground', className: 'bg-foreground' },
        ],
    },
    {
        title: 'Primary',
        tokens: [
            { name: 'Primary', variable: '--primary', className: 'bg-primary' },
            { name: 'Primary Foreground', variable: '--primary-foreground', className: 'bg-primary-foreground' },
        ],
    },
    {
        title: 'Secondary',
        tokens: [
            { name: 'Secondary', variable: '--secondary', className: 'bg-secondary' },
            { name: 'Secondary Foreground', variable: '--secondary-foreground', className: 'bg-secondary-foreground' },
        ],
    },
    {
        title: 'Muted',
        tokens: [
            { name: 'Muted', variable: '--muted', className: 'bg-muted' },
            { name: 'Muted Foreground', variable: '--muted-foreground', className: 'bg-muted-foreground' },
        ],
    },
    {
        title: 'Accent',
        tokens: [
            { name: 'Accent', variable: '--accent', className: 'bg-accent' },
            { name: 'Accent Foreground', variable: '--accent-foreground', className: 'bg-accent-foreground' },
        ],
    },
    {
        title: 'Semantic States',
        tokens: [
            { name: 'Success', variable: '--success', className: 'bg-success' },
            { name: 'Success Foreground', variable: '--success-foreground', className: 'bg-success-foreground' },
            { name: 'Warning', variable: '--warning', className: 'bg-warning' },
            { name: 'Warning Foreground', variable: '--warning-foreground', className: 'bg-warning-foreground' },
            { name: 'Info', variable: '--info', className: 'bg-info' },
            { name: 'Info Foreground', variable: '--info-foreground', className: 'bg-info-foreground' },
        ],
    },
    {
        title: 'Destructive',
        tokens: [
            { name: 'Destructive', variable: '--destructive', className: 'bg-destructive' },
            { name: 'Destructive Foreground', variable: '--destructive-foreground', className: 'bg-destructive-foreground' },
        ],
    },
    {
        title: 'Borders & Inputs',
        tokens: [
            { name: 'Border', variable: '--border', className: 'bg-border' },
            { name: 'Input', variable: '--input', className: 'bg-input' },
            { name: 'Ring', variable: '--ring', className: 'bg-ring' },
        ],
    },
    {
        title: 'Popovers & Cards',
        tokens: [
            { name: 'Popover', variable: '--popover', className: 'bg-popover' },
            { name: 'Popover Foreground', variable: '--popover-foreground', className: 'bg-popover-foreground' },
            { name: 'Card', variable: '--card', className: 'bg-card' },
            { name: 'Card Foreground', variable: '--card-foreground', className: 'bg-card-foreground' },
        ],
    },
    {
        title: 'Charts',
        tokens: [
            { name: 'Chart 1', variable: '--chart-1', className: 'bg-chart-1' },
            { name: 'Chart 2', variable: '--chart-2', className: 'bg-chart-2' },
            { name: 'Chart 3', variable: '--chart-3', className: 'bg-chart-3' },
            { name: 'Chart 4', variable: '--chart-4', className: 'bg-chart-4' },
            { name: 'Chart 5', variable: '--chart-5', className: 'bg-chart-5' },
        ],
    },
];

const ColorSwatch = ({ token }: { token: ColorToken }) => {
    const [value, setValue] = useState('');

    useEffect(() => {
        const updateValue = () => {
            // Create a temp element to resolve the variable
            const temp = document.createElement('div');
            temp.style.display = 'none';
            temp.style.color = `hsl(var(${token.variable}))`;
            document.body.appendChild(temp);

            const computed = getComputedStyle(temp).color;
            setValue(computed); // Returns rgb(...) usually

            document.body.removeChild(temp);
        };

        updateValue();
        // Watch for class changes on HTML element (dark mode toggle)
        const observer = new MutationObserver(updateValue);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, [token.variable]);

    return (
        <div className="flex flex-col gap-2">
            <div className={cn("h-16 w-full rounded-md border shadow-sm", token.className)} />
            <div className="flex flex-col text-xs">
                <span className="font-semibold">{token.name}</span>
                <span className="text-muted-foreground font-mono">{token.variable}</span>
                <span className="text-muted-foreground font-mono opacity-75">{value}</span>
            </div>
        </div>
    );
};

export const DynamicColorPalette = () => {
    return (
        <div className="flex flex-col gap-8">
            {groups.map((group) => (
                <div key={group.title}>
                    <h3 className="text-lg font-medium mb-4">{group.title}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {group.tokens.map((token) => (
                            <ColorSwatch key={token.variable} token={token} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
