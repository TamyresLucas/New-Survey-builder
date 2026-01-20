import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from './ui/carousel';
import { Card, CardContent } from './ui/card';

const meta = {
    title: 'Components/Data Display/Carousel',
    component: Carousel,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

// === DEFAULT ===

export const Default: Story = {
    render: () => (
        <Carousel className="w-full max-w-xs">
            <CarouselContent>
                {Array.from({ length: 5 }).map((_, index) => (
                    <CarouselItem key={index}>
                        <div className="p-1">
                            <Card className="border-primary/40">
                                <CardContent className="flex aspect-square items-center justify-center p-6">
                                    <span className="text-4xl font-semibold">{index + 1}</span>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    ),
};

// === MULTIPLE ITEMS (Card Peek) ===

export const MultipleItems: Story = {
    render: () => (
        <Carousel className="w-full max-w-sm">
            <CarouselContent className="-ml-2 md:-ml-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                            <Card className="border-primary/40">
                                <CardContent className="flex aspect-square items-center justify-center p-6">
                                    <span className="text-2xl font-semibold">{index + 1}</span>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    ),
};

// === VERTICAL ORIENTATION ===

export const Vertical: Story = {
    render: () => (
        <Carousel
            opts={{
                align: "start",
            }}
            orientation="vertical"
            className="w-full max-w-xs"
        >
            <CarouselContent className="-mt-1 h-[200px]">
                {Array.from({ length: 5 }).map((_, index) => (
                    <CarouselItem key={index} className="pt-1 md:basis-1/2">
                        <div className="p-1">
                            <Card className="border-primary/40">
                                <CardContent className="flex items-center justify-center p-6">
                                    <span className="text-3xl font-semibold">{index + 1}</span>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    ),
};

// === WITH INDICATORS (Dots) ===

const CarouselWithIndicators = () => {
    const [api, setApi] = React.useState<any>();
    const [current, setCurrent] = React.useState(0);
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    return (
        <div className="w-full max-w-xs">
            <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <CarouselItem key={index}>
                            <div className="p-1">
                                <Card className="border-primary/40">
                                    <CardContent className="flex aspect-square items-center justify-center p-6">
                                        <span className="text-4xl font-semibold">{index + 1}</span>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
            <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: count }).map((_, index) => (
                    <button
                        key={index}
                        className={`h-2 w-2 rounded-full transition-colors ${current === index + 1 ? 'bg-primary' : 'bg-[color-mix(in_oklab,hsl(var(--primary)),hsl(var(--background))_80%)]'
                            }`}
                        onClick={() => api?.scrollTo(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
                Slide {current} of {count}
            </p>
        </div>
    );
};

export const WithIndicators: Story = {
    render: () => <CarouselWithIndicators />,
};

// === LOOP / INFINITE ===

export const Loop: Story = {
    render: () => (
        <Carousel
            opts={{
                align: "start",
                loop: true,
            }}
            className="w-full max-w-xs"
        >
            <CarouselContent>
                {Array.from({ length: 5 }).map((_, index) => (
                    <CarouselItem key={index}>
                        <div className="p-1">
                            <Card className="border-primary/40">
                                <CardContent className="flex aspect-square items-center justify-center p-6">
                                    <span className="text-4xl font-semibold">{index + 1}</span>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    ),
};

// === GALLERY / IMAGE CAROUSEL ===

const images = [
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=300&fit=crop",
];

export const ImageGallery: Story = {
    render: () => (
        <Carousel className="w-full max-w-md">
            <CarouselContent>
                {images.map((src, index) => (
                    <CarouselItem key={index}>
                        <div className="p-1">
                            <Card className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div
                                        className="h-[200px] bg-muted flex items-center justify-center"
                                        style={{
                                            background: `linear-gradient(135deg, hsl(${index * 60}, 70%, 50%), hsl(${index * 60 + 30}, 70%, 40%))`
                                        }}
                                    >
                                        <span className="text-white text-2xl font-bold">Image {index + 1}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    ),
};

// === TESTIMONIALS CAROUSEL ===

const testimonials = [
    { name: "Sarah Johnson", role: "Product Manager", text: "This survey tool has transformed how we collect feedback." },
    { name: "Mike Chen", role: "UX Designer", text: "The most intuitive survey builder I've ever used." },
    { name: "Emily Davis", role: "Marketing Lead", text: "Our response rates increased by 40% since switching." },
    { name: "David Kim", role: "Data Analyst", text: "The analytics dashboard is incredibly powerful." },
];

export const Testimonials: Story = {
    render: () => (
        <Carousel className="w-full max-w-lg">
            <CarouselContent>
                {testimonials.map((testimonial, index) => (
                    <CarouselItem key={index}>
                        <div className="p-4">
                            <Card className="border-0 shadow-none bg-transparent">
                                <CardContent className="flex flex-col items-center text-center p-6">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                        <span className="text-primary font-semibold">
                                            {testimonial.name.charAt(0)}
                                        </span>
                                    </div>
                                    <p className="text-lg italic text-foreground mb-4">
                                        "{testimonial.text}"
                                    </p>
                                    <p className="font-semibold">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    ),
};

// === SURVEY QUESTION TYPES (Voxco-specific) ===

const questionTypes = [
    { icon: "📝", name: "Text", description: "Open-ended responses" },
    { icon: "☑️", name: "Multiple Choice", description: "Select one or more options" },
    { icon: "⭐", name: "Rating", description: "Star or number scale" },
    { icon: "📊", name: "Matrix", description: "Grid of questions" },
    { icon: "📅", name: "Date/Time", description: "Date picker input" },
    { icon: "📎", name: "File Upload", description: "Attach files" },
];

export const SurveyQuestionTypes: Story = {
    render: () => (
        <Carousel
            opts={{ align: "start" }}
            className="w-full max-w-md"
        >
            <CarouselContent className="-ml-2">
                {questionTypes.map((type, index) => (
                    <CarouselItem key={index} className="pl-2 basis-1/3">
                        <Card className="cursor-pointer border-primary/40 hover:border-primary transition-colors">
                            <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                                <span className="text-3xl mb-2">{type.icon}</span>
                                <p className="font-medium text-sm">{type.name}</p>
                                <p className="text-xs text-muted-foreground">{type.description}</p>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    ),
};

// === SIZES ===

export const Sizes: Story = {
    render: () => (
        <div className="space-y-8 w-full max-w-2xl">
            <div>
                <h4 className="text-sm font-medium mb-4">Small (max-w-xs)</h4>
                <Carousel className="w-full max-w-xs">
                    <CarouselContent>
                        {Array.from({ length: 3 }).map((_, index) => (
                            <CarouselItem key={index}>
                                <Card className="border-primary/40">
                                    <CardContent className="flex aspect-video items-center justify-center p-6">
                                        <span className="text-2xl font-semibold">{index + 1}</span>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
            <div>
                <h4 className="text-sm font-medium mb-4">Medium (max-w-md)</h4>
                <Carousel className="w-full max-w-md">
                    <CarouselContent>
                        {Array.from({ length: 3 }).map((_, index) => (
                            <CarouselItem key={index}>
                                <Card className="border-primary/40">
                                    <CardContent className="flex aspect-video items-center justify-center p-6">
                                        <span className="text-2xl font-semibold">{index + 1}</span>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </div>
    ),
};
