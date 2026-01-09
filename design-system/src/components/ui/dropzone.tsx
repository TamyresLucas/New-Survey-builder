import * as React from "react"
import { useDropzone, type DropzoneOptions } from "react-dropzone"
import { CloudUpload, File as FileIcon, X, Image as ImageIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface DropzoneProps extends Omit<DropzoneOptions, 'onDrop'> {
    className?: string
    onChange?: (files: File[]) => void
    value?: File[]
    type?: "file" | "image"
    dropMessage?: string
}

export function Dropzone({
    className,
    onChange,
    value = [],
    type = "file",
    dropMessage = "Drop files here or click to upload",
    ...props
}: DropzoneProps) {
    const [files, setFiles] = React.useState<File[]>(value)

    // Sync internal state with prop
    React.useEffect(() => {
        setFiles(value)
    }, [value])

    const onDrop = React.useCallback(
        (acceptedFiles: File[]) => {
            const newFiles = props.multiple ? [...files, ...acceptedFiles] : acceptedFiles
            setFiles(newFiles)
            onChange?.(newFiles)
        },
        [files, onChange, props.multiple]
    )

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept: type === "image" ? { "image/*": [] } : props.accept,
        ...props,
    })

    const removeFile = (e: React.MouseEvent, index: number) => {
        e.stopPropagation()
        const newFiles = files.filter((_, i) => i !== index)
        setFiles(newFiles)
        onChange?.(newFiles)
    }

    // Image Preview Component
    const ImagePreview = ({ file, index }: { file: File; index: number }) => {
        const [preview, setPreview] = React.useState<string | null>(null)

        React.useEffect(() => {
            const objectUrl = URL.createObjectURL(file)
            setPreview(objectUrl)
            return () => URL.revokeObjectURL(objectUrl)
        }, [file])

        return (
            <div className="relative group aspect-square w-full rounded-md border overflow-hidden">
                {preview ? (
                    <img src={preview} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex items-center justify-center w-full h-full bg-muted">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                )}
                <button
                    onClick={(e) => removeFile(e, index)}
                    className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        )
    }

    // File Preview List Item
    const FilePreview = ({ file, index }: { file: File; index: number }) => (
        <div className="flex items-center justify-between p-2 rounded-md border bg-muted/50 text-sm">
            <div className="flex items-center gap-2 truncate">
                <FileIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
                <span className="truncate max-w-[200px]">{file.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                    {(file.size / 1024).toFixed(1)} KB
                </span>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => removeFile(e, index)}
            >
                <X className="w-3 h-3" />
            </Button>
        </div>
    )

    return (
        <div className={cn("grid gap-4", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors text-center",
                    isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                    className
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-muted rounded-full">
                        <CloudUpload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">{dropMessage}</p>
                    <p className="text-xs text-muted-foreground">
                        {type === 'image' ? "Supports: JPG, PNG, GIF" : "Supports: All file types"}
                    </p>
                </div>
            </div>

            {/* File List / Gallery */}
            {files.length > 0 && (
                props.multiple && type === 'image' ? (
                    <div className="grid grid-cols-3 gap-2">
                        {files.map((file, i) => (
                            <ImagePreview key={i} file={file} index={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {files.map((file, i) => (
                            <FilePreview key={i} file={file} index={i} />
                        ))}
                    </div>
                )
            )}

            {/* Error Messages (if valid) - react-dropzone handles validation logic but displaying it requires accessing props or fileRejections */}
        </div>
    )
}
