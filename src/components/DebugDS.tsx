import { Button, Input, Label, Badge, Card, Separator } from '@voxco/design-system';

export const DebugDS = () => {
  return (
    <Card className="p-8 space-y-6 max-w-2xl border-2 border-dashed border-purple-500 m-8 mx-auto bg-slate-50 dark:bg-slate-900">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold font-['Outfit'] text-primary">Design System Integration</h2>
        <div className="flex gap-2 items-center">
             <Badge variant="default">Status: Linked</Badge>
             <Badge variant="outline">Local Package</Badge>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
            <h3 className="font-semibold">Form Elements</h3>
            <div className="space-y-2">
                <Label htmlFor="test-input">Interactive Input</Label>
                <Input id="test-input" placeholder="Type to test focus ring..." />
            </div>
        </div>
        <div className="space-y-4">
            <h3 className="font-semibold">Actions</h3>
            <div className="flex flex-col gap-3">
                <Button>Primary Action</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
            </div>
        </div>
      </div>
    </Card>
  );
};