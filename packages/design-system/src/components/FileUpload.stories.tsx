import type { Meta, StoryObj } from '@storybook/react';
import { Dropzone } from './ui/dropzone';
import { Label } from './ui/label';
import { useState } from 'react';

const meta: Meta<typeof Dropzone> = {
    title: 'Components/Form Elements/FileUpload',
    id: 'specific-fileupload',
    component: Dropzone,
    // tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'File Upload component using react-dropzone.',
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof Dropzone>;

export const Default: Story = {
    render: () => {
        const [files, setFiles] = useState<File[]>([]);
        return (
            <div className="space-y-2">
                <Dropzone value={files} onChange={setFiles} />
            </div>
        );
    },
};

export const WithLabel: Story = {
    render: () => {
        const [files, setFiles] = useState<File[]>([]);
        return (
            <div className="space-y-2">
                <Label>Upload Documents</Label>
                <Dropzone value={files} onChange={setFiles} dropMessage="Upload PDF or DOCX" />
            </div>
        );
    },
};

export const MultipleFiles: Story = {
    render: () => {
        const [files, setFiles] = useState<File[]>([]);
        return (
            <div className="space-y-2">
                <Dropzone value={files} onChange={setFiles} multiple dropMessage="Drag multiple files here" />
            </div>
        );
    },
};
