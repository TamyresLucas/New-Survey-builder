import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './ui/button';
import { Toaster } from './ui/toaster';
import { useToast } from '@/hooks/use-toast';

const ToastDemo = () => {
    const { toast } = useToast()

    return (
        <Button
            variant="outline"
            onClick={() => {
                toast({
                    title: "Scheduled: Catch up",
                    description: "Friday, February 10, 2023 at 5:57 PM",
                })
            }}
        >
            Show Toast
        </Button>
    )
}

const meta = {
    title: 'Components/Toast',
    component: Toaster, // Using Toaster as the component to document
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <>
                <Story />
                <Toaster />
            </>
        ),
    ],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <ToastDemo />,
};

export const Destructive: Story = {
    render: () => {
        const { toast } = useToast()
        return (
            <Button
                variant="destructive"
                onClick={() => {
                    toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: "There was a problem with your request.",
                    })
                }}
            >
                Show Destructive Toast
            </Button>
        )
    }
}

export const Success: Story = {
    render: () => {
        const { toast } = useToast()
        return (
            <Button
                variant="success"
                onClick={() => {
                    toast({
                        variant: "success",
                        title: "Success!",
                        description: "Your action was completed successfully.",
                    })
                }}
            >
                Show Success Toast
            </Button>
        )
    }
}

export const Warning: Story = {
    render: () => {
        const { toast } = useToast()
        return (
            <Button
                variant="warning"
                onClick={() => {
                    toast({
                        variant: "warning",
                        title: "Warning",
                        description: "Please proceed with caution.",
                    })
                }}
            >
                Show Warning Toast
            </Button>
        )
    }
}
