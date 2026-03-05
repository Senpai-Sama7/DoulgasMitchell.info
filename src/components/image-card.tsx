"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { GalleryImage } from "@/lib/data";
import { Reactions } from "./reactions";
import { cn } from "@/lib/utils";

interface ImageCardProps {
  image: GalleryImage;
  index: number;
  onImageClick: (index: number) => void;
}

// Generate a simple blur placeholder based on image dimensions
const generateBlurPlaceholder = (width: number, height: number): string => {
  const aspectRatio = width / height;
  const baseColor = aspectRatio > 1 ? "oklch(0.85 0.01 75)" : "oklch(0.75 0.01 70)";
  const svg = `<svg width="${Math.min(width, 40)}" height="${Math.min(height, 40)}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${baseColor}"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export function ImageCard({ image, index, onImageClick }: ImageCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Calculate height based on aspect ratio
  const aspectRatio = image.width / image.height;
  
  // Determine if image is portrait or landscape for masonry
  const isPortrait = image.height > image.width;
  const isSquare = Math.abs(aspectRatio - 1) < 0.1;

  // Intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onImageClick(index);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.05 }}
      className="masonry-item group"
    >
      <div
        onClick={() => onImageClick(index)}
        onKeyDown={handleCardKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Open image: ${image.alt}`}
        className={cn(
          "image-card relative overflow-hidden rounded-xl cursor-pointer bg-accent/30",
          "transform transition-all duration-500 ease-out",
          "hover:shadow-2xl hover:shadow-primary/10"
        )}
        style={{
          aspectRatio: `${image.width} / ${image.height}`,
        }}
      >
        {/* Loading Skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 animate-pulse bg-accent/50" />
        )}

        {/* Lazy Loaded Image with Blur Placeholder */}
        {isInView && (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 25vw"
            className={cn(
              "object-cover transition-all duration-700",
              isLoaded ? "blur-0 scale-100" : "blur-lg scale-105",
              "group-hover:scale-110 group-hover:rotate-1"
            )}
            loading="lazy"
            placeholder="blur"
            blurDataURL={generateBlurPlaceholder(image.width, image.height)}
            onLoad={() => setIsLoaded(true)}
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="p-4">
            <h3 className="text-white font-serif text-base mb-1 line-clamp-2">
              {image.alt}
            </h3>
            <p className="text-white/70 text-xs line-clamp-2 mb-2">
              {image.caption}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs font-mono">
                {new Date(image.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white/80">
                {image.series === "recent-post" ? "Recent" : 
                 image.series === "tech-deck" ? "Tech" : "Project"}
              </span>
            </div>
          </div>
        </div>

        {/* Reactions - shown on hover */}
        <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100">
          <div onClick={(e) => e.stopPropagation()}>
            <Reactions itemId={image.id} variant="dark" compact />
          </div>
        </div>

        {/* Zoom Icon Indicator */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
