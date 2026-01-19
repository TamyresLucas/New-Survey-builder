import { useState, useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const popularFonts = [
    "Inter",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "Oswald",
    "Raleway",
    "Nunito",
    "Merriweather",
    "Playfair Display",
    "Rubik",
    "Work Sans",
    "Kanit",
    "Fira Sans"
];

export const FontPreview = () => {
    const [font, setFont] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('global-font') || 'Inter';
        }
        return 'Inter';
    });

    const handleFontChange = (newFont: string) => {
        setFont(newFont);
        localStorage.setItem('global-font', newFont);
        // Notify decorator to update
        window.dispatchEvent(new CustomEvent('font-changed', {
            detail: { font: newFont }
        }));
    };

    useEffect(() => {
        const link = document.createElement("link");
        link.id = `font-preview-${font}`;
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap`;
        link.rel = "stylesheet";

        // Remove previous font links to avoid clutter
        const existing = document.getElementById(`font-preview-${font}`);
        if (!existing) {
            document.head.appendChild(link);
        }

        return () => {
            // proper cleanup is tricky with multiple fast switches, but appending new ones is fine mostly
        }
    }, [font]);

    return (
        <div className="space-y-8 p-4 max-w-4xl">
            <div className="flex flex-col gap-4">
                <label className="text-sm font-medium text-muted-foreground">Select a Font Family (Google Fonts)</label>
                <div className="w-[300px]">
                    <Select onValueChange={handleFontChange} value={font}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {popularFonts.map(f => (
                                <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div style={{ fontFamily: font }} className="space-y-8 border rounded-lg p-8 bg-card text-card-foreground shadow-sm">
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Heading 1</p>
                    <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl">
                        The quick brown fox
                    </h1>
                </div>

                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Heading 2</p>
                    <h2 className="text-3xl font-semibold tracking-tight transition-colors">
                        Jumps over the lazy dog
                    </h2>
                </div>

                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Body Text</p>
                    <p className="leading-7 [&:not(:first-child)]:mt-6 max-w-prose">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Character Set</p>
                    <p className="text-xl tracking-wide break-all font-medium opacity-80">
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                        abcdefghijklmnopqrstuvwxyz<br />
                        0123456789 ©®™$£€¥
                    </p>
                </div>
            </div>
        </div>
    )
}
