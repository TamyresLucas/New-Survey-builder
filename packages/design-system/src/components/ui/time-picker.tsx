import * as React from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface TimePickerProps {
    value?: string // formato "HH:MM"
    onChange?: (value: string) => void
    placeholder?: string
    disabled?: boolean
    className?: string
    hourPlaceholder?: string
    minutePlaceholder?: string
}

export function TimePicker({
    value,
    onChange,
    // placeholder = "Select time",
    disabled = false,
    className,
    hourPlaceholder = "HH",
    minutePlaceholder = "MM",
}: TimePickerProps) {
    const [hour, setHour] = React.useState<string>(
        value?.split(':')[0] || ''
    )
    const [minute, setMinute] = React.useState<string>(
        value?.split(':')[1] || ''
    )

    // Generate hours (00-23) and minutes (00-59)
    const hours = React.useMemo(
        () => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')),
        []
    )

    const minutes = React.useMemo(
        () => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')),
        []
    )

    // Update effect
    React.useEffect(() => {
        if (hour && minute) {
            onChange?.(`${hour}:${minute}`)
        }
    }, [hour, minute]) // Removed onChange from dep array to avoid loops if onChange is unstable

    // Sync with prop
    React.useEffect(() => {
        if (value) {
            const parts = value.split(':')
            if (parts.length === 2) {
                const h = parts[0]
                const m = parts[1]
                if (h !== hour) setHour(h)
                if (m !== minute) setMinute(m)
            }
        }
    }, [value])

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Select
                value={hour}
                onValueChange={setHour}
                disabled={disabled}
            >
                <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder={hourPlaceholder} />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                    {hours.map((h) => (
                        <SelectItem key={h} value={h}>
                            {h}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <span className="text-lg font-medium text-muted-foreground">:</span>

            <Select
                value={minute}
                onValueChange={setMinute}
                disabled={disabled}
            >
                <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder={minutePlaceholder} />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                    {minutes.map((m) => (
                        <SelectItem key={m} value={m}>
                            {m}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
