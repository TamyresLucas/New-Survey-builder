import type { Meta, StoryObj } from '@storybook/react';
import * as React from "react"
import { Check, ChevronsUpDown } from "./ui/icons"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "./ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./ui/popover"

const frameworks = [
    {
        value: "next.js",
        label: "Next.js",
    },
    {
        value: "sveltekit",
        label: "SvelteKit",
    },
    {
        value: "nuxt.js",
        label: "Nuxt.js",
    },
    {
        value: "remix",
        label: "Remix",
    },
    {
        value: "astro",
        label: "Astro",
    },
]

const ComboboxDemo = () => {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {value
                        ? frameworks.find((framework) => framework.value === value)?.label
                        : "Select framework..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search framework..." />
                    <CommandList>
                        <CommandEmpty>No framework found.</CommandEmpty>
                        <CommandGroup>
                            {frameworks.map((framework) => (
                                <CommandItem
                                    key={framework.value}
                                    value={framework.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === framework.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {framework.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

const meta: Meta<typeof ComboboxDemo> = {
    title: 'Components/Form Elements/Combobox',
    component: ComboboxDemo,
    parameters: {
        layout: 'centered',
    },
    // tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <ComboboxDemo />,
};

// === MULTI-SELECT ===

const surveyTopics = [
    { value: "customer-satisfaction", label: "Customer Satisfaction" },
    { value: "product-feedback", label: "Product Feedback" },
    { value: "employee-engagement", label: "Employee Engagement" },
    { value: "market-research", label: "Market Research" },
    { value: "brand-awareness", label: "Brand Awareness" },
    { value: "user-experience", label: "User Experience" },
    { value: "event-feedback", label: "Event Feedback" },
]

const MultiSelectDemo = () => {
    const [open, setOpen] = React.useState(false)
    const [selectedValues, setSelectedValues] = React.useState<string[]>(["customer-satisfaction"])

    const handleSelect = (currentValue: string) => {
        setSelectedValues(prev =>
            prev.includes(currentValue)
                ? prev.filter(v => v !== currentValue)
                : [...prev, currentValue]
        )
    }

    const handleRemove = (valueToRemove: string) => {
        setSelectedValues(prev => prev.filter(v => v !== valueToRemove))
    }

    return (
        <div className="w-full max-w-md">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-auto min-h-10"
                    >
                        <div className="flex flex-wrap gap-1">
                            {selectedValues.length > 0 ? (
                                selectedValues.map(value => {
                                    const topic = surveyTopics.find(t => t.value === value)
                                    return (
                                        <span
                                            key={value}
                                            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                                        >
                                            {topic?.label}
                                            <button
                                                type="button"
                                                className="hover:bg-primary/20 rounded-full p-0.5"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleRemove(value)
                                                }}
                                            >
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    )
                                })
                            ) : (
                                <span className="text-muted-foreground">Select topics...</span>
                            )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search topics..." />
                        <CommandList>
                            <CommandEmpty>No topic found.</CommandEmpty>
                            <CommandGroup>
                                {surveyTopics.map((topic) => (
                                    <CommandItem
                                        key={topic.value}
                                        value={topic.value}
                                        onSelect={() => handleSelect(topic.value)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedValues.includes(topic.value) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {topic.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <p className="text-sm text-muted-foreground mt-2">
                {selectedValues.length} topic{selectedValues.length !== 1 ? 's' : ''} selected
            </p>
        </div>
    )
}

export const MultiSelect: Story = {
    render: () => <MultiSelectDemo />,
};

// === SURVEY MULTI-SELECT QUESTION ===

export const SurveyMultiSelectQuestion: Story = {
    render: () => {
        const [selectedValues, setSelectedValues] = React.useState<string[]>([])
        const [open, setOpen] = React.useState(false)

        const features = [
            { value: "analytics", label: "Advanced Analytics" },
            { value: "api", label: "API Access" },
            { value: "integrations", label: "Third-party Integrations" },
            { value: "customization", label: "Custom Branding" },
            { value: "support", label: "Priority Support" },
            { value: "security", label: "Enhanced Security" },
        ]

        const handleSelect = (value: string) => {
            setSelectedValues(prev =>
                prev.includes(value)
                    ? prev.filter(v => v !== value)
                    : [...prev, value]
            )
        }

        return (
            <div className="w-full max-w-md p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Which features are most important to you?</h3>
                <p className="text-sm text-muted-foreground mb-4">Select all that apply.</p>

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-between h-auto min-h-10 text-left"
                        >
                            {selectedValues.length > 0
                                ? `${selectedValues.length} feature${selectedValues.length > 1 ? 's' : ''} selected`
                                : "Click to select features..."
                            }
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                        <Command>
                            <CommandInput placeholder="Search features..." />
                            <CommandList>
                                <CommandEmpty>No feature found.</CommandEmpty>
                                <CommandGroup>
                                    {features.map((feature) => (
                                        <CommandItem
                                            key={feature.value}
                                            value={feature.value}
                                            onSelect={() => handleSelect(feature.value)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedValues.includes(feature.value) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {feature.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {selectedValues.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {selectedValues.map(value => {
                            const feature = features.find(f => f.value === value)
                            return (
                                <span
                                    key={value}
                                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                                >
                                    {feature?.label}
                                </span>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    },
};

// === DISABLED ===

const DisabledCombobox = () => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-[200px] justify-between"
                    disabled
                >
                    Select option...
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
        </Popover>
    )
}

export const Disabled: Story = {
    render: () => <DisabledCombobox />,
};

// === WITH GROUPS ===

const groupedItems = {
    "Question Types": [
        { value: "radio", label: "Radio Button" },
        { value: "checkbox", label: "Checkbox" },
        { value: "dropdown", label: "Dropdown" },
    ],
    "Text Inputs": [
        { value: "short-text", label: "Short Text" },
        { value: "long-text", label: "Long Text" },
        { value: "email", label: "Email" },
    ],
    "Advanced": [
        { value: "matrix", label: "Matrix" },
        { value: "ranking", label: "Ranking" },
        { value: "rating", label: "Rating Scale" },
    ],
};

const GroupedCombobox = () => {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

    const allItems = Object.values(groupedItems).flat();
    const selectedLabel = allItems.find((item) => item.value === value)?.label;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[250px] justify-between"
                >
                    {selectedLabel || "Select question type..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
                <Command>
                    <CommandInput placeholder="Search types..." />
                    <CommandList>
                        <CommandEmpty>No type found.</CommandEmpty>
                        {Object.entries(groupedItems).map(([group, items]) => (
                            <CommandGroup key={group} heading={group}>
                                {items.map((item) => (
                                    <CommandItem
                                        key={item.value}
                                        value={item.value}
                                        onSelect={(currentValue) => {
                                            setValue(currentValue === value ? "" : currentValue)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === item.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {item.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export const WithGroups: Story = {
    render: () => <GroupedCombobox />,
};

// === ASYNC SEARCH ===

const AsyncCombobox = () => {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [items, setItems] = React.useState<{ value: string, label: string }[]>([])

    const mockSearch = (query: string) => {
        setLoading(true)
        // Simulate API delay
        setTimeout(() => {
            const allItems = [
                { value: "user-1", label: "john@example.com" },
                { value: "user-2", label: "jane@example.com" },
                { value: "user-3", label: "bob@example.com" },
                { value: "user-4", label: "alice@example.com" },
                { value: "user-5", label: "charlie@example.com" },
            ]
            if (query) {
                setItems(allItems.filter(item =>
                    item.label.toLowerCase().includes(query.toLowerCase())
                ))
            } else {
                setItems(allItems)
            }
            setLoading(false)
        }, 500)
    }

    React.useEffect(() => {
        if (open) {
            mockSearch("")
        }
    }, [open])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[250px] justify-between"
                >
                    {value ? items.find((item) => item.value === value)?.label : "Select user..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
                <Command>
                    <CommandInput
                        placeholder="Search users..."
                        onValueChange={(search) => mockSearch(search)}
                    />
                    <CommandList>
                        {loading ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Loading...
                            </div>
                        ) : items.length === 0 ? (
                            <CommandEmpty>No users found.</CommandEmpty>
                        ) : (
                            <CommandGroup>
                                {items.map((item) => (
                                    <CommandItem
                                        key={item.value}
                                        value={item.value}
                                        onSelect={(currentValue) => {
                                            setValue(currentValue === value ? "" : currentValue)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === item.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {item.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export const AsyncSearch: Story = {
    render: () => <AsyncCombobox />,
};

// === SURVEY BRANCHING TARGET (Voxco-specific) ===

const surveyQuestions = [
    { value: "q1", label: "Q1: Customer Satisfaction", block: "Block 1" },
    { value: "q2", label: "Q2: Product Quality", block: "Block 1" },
    { value: "q3", label: "Q3: Service Speed", block: "Block 1" },
    { value: "q4", label: "Q4: Would Recommend", block: "Block 2" },
    { value: "q5", label: "Q5: Comments", block: "Block 2" },
    { value: "end", label: "End Survey", block: "Special" },
];

const BranchingCombobox = () => {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

    const groupedQuestions = surveyQuestions.reduce((acc, q) => {
        if (!acc[q.block]) acc[q.block] = [];
        acc[q.block].push(q);
        return acc;
    }, {} as Record<string, typeof surveyQuestions>);

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">Skip to:</label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[280px] justify-between"
                    >
                        {value
                            ? surveyQuestions.find((q) => q.value === value)?.label
                            : "Select destination..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0">
                    <Command>
                        <CommandInput placeholder="Search questions..." />
                        <CommandList>
                            <CommandEmpty>No question found.</CommandEmpty>
                            {Object.entries(groupedQuestions).map(([block, questions]) => (
                                <CommandGroup key={block} heading={block}>
                                    {questions.map((q) => (
                                        <CommandItem
                                            key={q.value}
                                            value={q.value}
                                            onSelect={(currentValue) => {
                                                setValue(currentValue === value ? "" : currentValue)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === q.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {q.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ))}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export const SurveyBranchingTarget: Story = {
    render: () => <BranchingCombobox />,
};
