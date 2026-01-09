import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const SemanticColorsDemo = () => {
    return (
        <div className="space-y-8 p-4">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Semantic Alerts</h2>
                <div className="grid gap-4">
                    <Alert variant="success">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>
                            Your changes have been saved successfully.
                        </AlertDescription>
                    </Alert>
                    <Alert variant="warning">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Warning</AlertTitle>
                        <AlertDescription>
                            Your account is about to expire. Please renew your subscription.
                        </AlertDescription>
                    </Alert>
                    <Alert variant="info">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Info</AlertTitle>
                        <AlertDescription>
                            New features are available in the dashboard.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Semantic Tokens Palette</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Success */}
                    <div className="space-y-2">
                        <div className="p-4 rounded-md bg-success text-success-foreground">
                            <span className="font-bold">bg-success</span>
                            <br />
                            <span className="text-sm opacity-90">text-success-foreground</span>
                        </div>
                        <div className="p-4 rounded-md border border-success text-success">
                            <span className="font-bold">text-success</span>
                            <br />
                            <span className="text-sm opacity-90">border-success</span>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="space-y-2">
                        <div className="p-4 rounded-md bg-warning text-warning-foreground">
                            <span className="font-bold">bg-warning</span>
                            <br />
                            <span className="text-sm opacity-90">text-warning-foreground</span>
                        </div>
                        <div className="p-4 rounded-md border border-warning text-warning">
                            <span className="font-bold">text-warning</span>
                            <br />
                            <span className="text-sm opacity-90">border-warning</span>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-2">
                        <div className="p-4 rounded-md bg-info text-info-foreground">
                            <span className="font-bold">bg-info</span>
                            <br />
                            <span className="text-sm opacity-90">text-info-foreground</span>
                        </div>
                        <div className="p-4 rounded-md border border-info text-info">
                            <span className="font-bold">text-info</span>
                            <br />
                            <span className="text-sm opacity-90">border-info</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const meta = {
    title: 'Design Patterns/Semantic Colors',
    component: SemanticColorsDemo,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof SemanticColorsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <SemanticColorsDemo />,
};
