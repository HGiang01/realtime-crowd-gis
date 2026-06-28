import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageViewerProps {
    images?: string[];
}

export const ImageViewer = ({ images = [] }: ImageViewerProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center rounded-xl border border-wg-outline-variant bg-wg-surface-container-lowest text-sm text-on-wg-background/50 min-h-0">
                No images available
            </div>
        );
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    return (
        <div className="relative flex-1 min-h-0 rounded-xl overflow-hidden border border-wg-outline-variant bg-wg-surface-container-lowest group">
            <img
                src={images[currentIndex]}
                alt={`Location ${currentIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
                loading="lazy"
            />

            {images.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                        aria-label="Next image"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs tracking-wider font-medium">
                        {currentIndex + 1} / {images.length}
                    </div>
                </>
            )}
        </div>
    );
};