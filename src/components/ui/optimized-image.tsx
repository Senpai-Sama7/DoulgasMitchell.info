"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  aspectRatio?: "square" | "video" | "portrait" | "landscape" | "auto";
  objectFit?: "cover" | "contain" | "fill" | "none";
  fadeIn?: boolean;
  shimmer?: boolean;
}

// Generate a simple blur placeholder based on color
function generateBlurDataURL(color: string = "#1a1a2e"): string {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 8;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 8, 8);
  }
  return canvas.toDataURL("image/png");
}

// Shimmer effect component
function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

// Aspect ratio classes
const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  auto: "",
};

// Object fit classes
const objectFitClasses = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
  none: "object-none",
};

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  containerClassName,
  priority = false,
  sizes,
  quality = 85,
  placeholder = "blur",
  blurDataURL,
  onLoad,
  onError,
  aspectRatio = "square",
  objectFit = "cover",
  fadeIn = true,
  shimmer = true,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [blurPlaceholder, setBlurPlaceholder] = React.useState(blurDataURL);

  // Generate blur placeholder if not provided
  React.useEffect(() => {
    if (!blurPlaceholder && placeholder === "blur") {
      setBlurPlaceholder(generateBlurDataURL());
    }
  }, [blurPlaceholder, placeholder]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const containerClasses = cn(
    "relative overflow-hidden bg-muted",
    aspectRatio !== "auto" && aspectRatioClasses[aspectRatio],
    containerClassName
  );

  const imageClasses = cn(
    objectFitClasses[objectFit],
    "transition-all duration-300",
    fadeIn && isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100",
    className
  );

  if (hasError) {
    return (
      <div className={containerClasses}>
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center p-4">
            <svg
              className="w-12 h-12 mx-auto mb-2 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-muted-foreground">Failed to load image</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Blur placeholder */}
      <AnimatePresence>
        {isLoading && placeholder === "blur" && blurPlaceholder && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={blurPlaceholder}
              alt=""
              fill
              className="object-cover blur-xl scale-110"
              priority={false}
              unoptimized
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shimmer effect */}
      {isLoading && shimmer && <Shimmer />}

      {/* Main image */}
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
          className={imageClasses}
          priority={priority}
          quality={quality}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width || 400}
          height={height || 400}
          sizes={sizes}
          className={imageClasses}
          priority={priority}
          quality={quality}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}

// Gallery-optimized image component with hover effects
interface GalleryImageProps extends OptimizedImageProps {
  title?: string;
  description?: string;
  tags?: string[];
  showOverlay?: boolean;
  onClick?: () => void;
}

export function GalleryImage({
  title,
  description,
  tags,
  showOverlay = true,
  onClick,
  className,
  ...props
}: GalleryImageProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      className={cn("group relative cursor-pointer", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <OptimizedImage {...props} fadeIn={true} />

      {/* Overlay */}
      <AnimatePresence>
        {showOverlay && isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
          >
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {title && (
                <motion.h3
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-white font-semibold mb-1"
                >
                  {title}
                </motion.h3>
              )}
              {description && (
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="text-white/80 text-sm line-clamp-2"
                >
                  {description}
                </motion.p>
              )}
              {tags && tags.length > 0 && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap gap-1 mt-2"
                >
                  {tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs rounded-full bg-white/20 text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Avatar image with fallback
interface AvatarImageProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const avatarSizes = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

export function AvatarImage({ src, alt, size = "md", className }: AvatarImageProps) {
  const [hasError, setHasError] = React.useState(false);
  const initials = alt
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium",
          avatarSizes[size],
          className
        )}
      >
        <span className="text-sm">{initials}</span>
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size === "xl" ? 64 : size === "lg" ? 48 : size === "md" ? 40 : 32}
      height={size === "xl" ? 64 : size === "lg" ? 48 : size === "md" ? 40 : 32}
      className={cn("rounded-full", className)}
      onError={() => setHasError(true)}
      aspectRatio="auto"
    />
  );
}