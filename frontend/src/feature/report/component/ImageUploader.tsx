import React, { useRef, useState } from "react";
import { Camera, CircleX, Image, ImagePlus } from "lucide-react";

export interface ImageItem {
    file: File;
    preview: string;
}

interface ImageUploaderProps {
    images: ImageItem[];
    setImages: React.Dispatch<React.SetStateAction<ImageItem[]>>;
}

export default function ImageUploader({images = [], setImages}: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const processFiles = (files: File[]) => {
        const imageFiles = files.filter((file) => file.type.startsWith("image/"));
        if (imageFiles.length > 0) {
            const newImages = imageFiles.map((file) => ({
                file: file,
                preview: URL.createObjectURL(file),
            }));
            setImages((prev) => [...prev, ...newImages]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        processFiles(files);
        e.target.value = "";
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const relatedTarget = e.relatedTarget as Node;
        if (e.currentTarget.contains(relatedTarget)) return;

        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files || []);
        processFiles(files);
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setImages((prev) => {
            URL.revokeObjectURL(prev[indexToRemove].preview);
            return prev.filter((_, index) => index !== indexToRemove);
        });
    };

    return (
        <div
            className={`flex-1 rounded-xl border border-wg-outline-variant flex flex-col relative overflow-hidden min-h-0 transition-all duration-200 ${
                isDragging
                    ? "border-wg-primary bg-wg-primary-soft/50 ring-4 ring-wg-primary/20"
                    : "border-wg-outline-variant"
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-wg-primary-soft/80 backdrop-blur-sm flex flex-col items-center justify-center text-wg-primary">
                    <span className="material-symbols-outlined text-6xl mb-4 animate-bounce">
                        <ImagePlus size={48} />
                    </span>
                    <span className="text-xl font-bold">
                        Drop your images here
                    </span>
                </div>
            )}

            {images?.length > 0 ? (
                <div className="flex-1 flex flex-col min-h-0 p-4">
                    <div className="flex-1 overflow-y-auto pr-2 pb-2 min-h-0">
                        <div className="grid grid-cols-2 gap-4">
                            {images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className="relative aspect-video rounded-lg overflow-hidden border border-wg-outline-variant/30 group"
                                >
                                    <img
                                        src={img.preview}
                                        alt={`Preview ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(idx)}
                                        className="absolute top-2 right-2 bg-wg-surface-container/80 backdrop-blur text-on-wg-surface p-1 rounded-full hover:bg-wg-error hover:text-on-wg-error transition-colors shadow-sm flex items-center justify-center cursor-pointer opacity-80 hover:opacity-100"
                                        title="Delete Image"
                                    >
                                        <CircleX />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="shrink-0 flex gap-4 justify-center pt-4 mt-2 border-t border-wg-outline-variant/20">
                        <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="flex items-center text-sm gap-2 px-4 py-2 rounded-xl border border-transparent bg-wg-surface-container text-on-wg-surface hover:bg-wg-outline-variant hover:text-black"
                        >
                            Take Photo
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center text-sm gap-2 px-4 py-2 rounded-xl border border-transparent bg-wg-surface-container text-on-wg-surface hover:bg-wg-outline-variant hover:text-black"
                        >
                            Choose From Library
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex gap-6 items-center justify-center p-8 mt-4 border-t border-wg-outline-variant/20">
                    <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="group flex-1 flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-wg-outline-variant/60 bg-wg-surface-container-lowest text-on-wg-surface/70 hover:bg-wg-primary/5 hover:border-wg-primary/60 hover:text-wg-primary transition-all duration-300"
                    >
                        <div className="p-3 rounded-full bg-wg-surface-container group-hover:bg-wg-primary/10 mb-3 transition-colors duration-300">
                            <Camera size={28} strokeWidth={1.5} />
                        </div>
                        <span className="font-semibold text-sm">
                            Take Photo
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="group flex-1 flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-wg-outline-variant/60 bg-wg-surface-container-lowest text-on-wg-surface/70 hover:bg-wg-primary/5 hover:border-wg-primary/60 hover:text-wg-primary transition-all duration-300"
                    >
                        <div className="p-3 rounded-full bg-wg-surface-container group-hover:bg-wg-primary/10 mb-3 transition-colors duration-300">
                            <Image size={28} strokeWidth={1.5} />
                        </div>
                        <span className="font-semibold text-sm">
                            Choose Library
                        </span>
                    </button>
                </div>
            )}

            <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
            />
        </div>
    );
}