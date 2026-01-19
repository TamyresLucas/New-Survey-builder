import type { Meta, StoryObj } from '@storybook/react';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from './ui/drawer';
import { Button } from './ui/button';

const meta = {
    title: 'Survey Rendering/Drawer',
    component: Drawer,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <Drawer {...args}>
            <DrawerTrigger asChild>
                <Button variant="outline">Open Drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>Move Goal</DrawerTitle>
                        <DrawerDescription>Set your daily activity goal.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 pb-0">
                        <div className="flex items-center justify-center space-x-2">
                            <span className="text-4xl font-bold tracking-tighter">
                                350
                            </span>
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Calories/day
                            </span>
                        </div>
                    </div>
                    <DrawerFooter>
                        <Button>Submit</Button>
                        <DrawerClose asChild>
                            <Button variant="ghost">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    ),
};
