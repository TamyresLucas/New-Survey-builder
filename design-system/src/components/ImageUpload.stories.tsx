import type { Meta, StoryObj } from '@storybook/react';
import { Dropzone } from './ui/dropzone';
import { Label } from './ui/label';
import { useState } from 'react';

const meta: Meta<typeof Dropzone> = {
    title: 'Components/ImageUpload',
    id: 'specific-imageupload',
    component: Dropzone,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Image Upload variant with preview grid.',
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof Dropzone>;

export const SingleImage: Story = {
    render: () => {
        const [files, setFiles] = useState<File[]>([]);
        return (
            <div className="space-y-2 max-w-sm">
                <Label>Profile Picture</Label>
                <Dropzone
                    value={files}
                    onChange={setFiles}
                    type="image"
                    maxFiles={1}
                    dropMessage="Upload Image"
                />
            </div>
        );
    },
};

export const ImageGallery: Story = {
    render: () => {
        const [files, setFiles] = useState<File[]>([]);
        return (
            <div className="space-y-2">
                <Label>Product Gallery</Label>
                <Dropzone
                    value={files}
                    onChange={setFiles}
                    type="image"
                    multiple
                    dropMessage="Drag images here"
                />
            </div>
        );
    },
};
