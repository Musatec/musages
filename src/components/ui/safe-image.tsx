"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SafeImageProps extends ImageProps {
    fallbackSrc?: string;
}

export function SafeImage({
    src,
    alt,
    className,
    fallbackSrc = "/icon.svg",
    ...props
}: SafeImageProps) {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    return (
        <div className={cn("relative overflow-hidden", className)}>
            <Image
                src={error ? fallbackSrc : src}
                alt={alt}
                fill={!props.width && !props.height}
                className={cn(
                    "transition-all duration-500",
                    loading ? "scale-105 blur-lg" : "scale-100 blur-0"
                )}
                onLoad={() => setLoading(false)}
                onError={() => setError(true)}
                {...props}
            />
            {loading && (
                <div className="absolute inset-0 bg-accent/20 animate-pulse z-10" />
            )}
        </div>
    );
}
