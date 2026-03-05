"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Share2, Maximize, Minimize, Download, Check, ExternalLink } from "lucide-react";
import { useLightboxStore } from "@/lib/store";
import { GalleryImage } from "@/lib/data";
import { Reactions } from "./reactions";

interface LightboxProps {
  images: GalleryImage[];
}

export function Lightbox({ images }: LightboxProps) {
  const { isOpen, currentIndex, close, next, prev, setCurrentIndex } = useLightboxStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];
  const dialogTitleId = currentImage ? `lightbox-title-${currentImage.id}` : undefined;
  const dialogDescriptionId = currentImage ? `lightbox-description-${currentImage.id}` : undefined;

  // Toggle fullscreen - defined first since it's used in keyboard handler
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          if (isFullscreen) {
            document.exitFullscreen();
            setIsFullscreen(false);
          } else {
            close();
          }
          break;
        case "ArrowLeft":
          if (currentIndex > 0) prev();
          break;
        case "ArrowRight":
          if (currentIndex < images.length - 1) next();
          break;
        case "Home":
          setCurrentIndex(0);
          break;
        case "End":
          setCurrentIndex(images.length - 1);
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
      }
    },
    [isOpen, currentIndex, close, prev, next, images.length, setCurrentIndex, isFullscreen, toggleFullscreen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      containerRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset internal state when lightbox closes
  useEffect(() => {
    if (!isOpen) {
      // Delay state reset to allow exit animation
      const timer = setTimeout(() => {
        setIsFullscreen(false);
        setShowShareMenu(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Handle pan gesture for mobile
  const handlePanEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;

    if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x < 0 && currentIndex < images.length - 1) {
        next();
      } else if (info.offset.x > 0 && currentIndex > 0) {
        prev();
      }
    }
  };

  // Share functionality
  const handleShare = useCallback(async (type: "copy" | "twitter" | "facebook") => {
    if (!currentImage) return;

    const shareUrl = typeof window !== "undefined" 
      ? `${window.location.origin}${currentImage.src}`
      : currentImage.src;
    const shareText = `${currentImage.alt} - ${currentImage.caption}`;

    switch (type) {
      case "copy":
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Failed to copy:", err);
        }
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank",
          "width=550,height=420"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank",
          "width=550,height=420"
        );
        break;
    }

    setShowShareMenu(false);
  }, [currentImage]);

  // Download image
  const handleDownload = useCallback(() => {
    if (!currentImage) return;
    
    const link = document.createElement("a");
    link.href = currentImage.src;
    link.download = currentImage.alt.replace(/\s+/g, "-").toLowerCase() + ".png";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentImage]);

  return (
    <AnimatePresence>
      {isOpen && currentImage && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="lightbox-overlay"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          aria-describedby={dialogDescriptionId}
          tabIndex={-1}
        >
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
            {/* Image Counter */}
            <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white font-mono text-sm">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareMenu(!showShareMenu);
                  }}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors duration-300"
                  aria-label="Share image"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>

                {/* Share Menu Dropdown */}
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 py-2 w-48 rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-xl border border-white/20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleShare("copy")}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <ExternalLink className="w-4 h-4" />
                        )}
                        {copied ? "Copied!" : "Copy Link"}
                      </button>
                      <button
                        onClick={() => handleShare("twitter")}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        Share on X
                      </button>
                      <button
                        onClick={() => handleShare("facebook")}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Share on Facebook
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Download Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors duration-300"
                aria-label="Download image"
              >
                <Download className="w-5 h-5 text-white" />
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors duration-300"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5 text-white" />
                ) : (
                  <Maximize className="w-5 h-5 text-white" />
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={close}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors duration-300"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Navigation Buttons - Desktop */}
          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors duration-300"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {currentIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors duration-300"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Image Container with Swipe Support */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handlePanEnd}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-5xl max-h-[85vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.div
                key={currentImage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="relative max-h-[70vh] w-auto"
                style={{ aspectRatio: `${currentImage.width} / ${currentImage.height}` }}
              >
                <Image
                  src={currentImage.src}
                  alt={currentImage.alt}
                  width={currentImage.width}
                  height={currentImage.height}
                  className="object-contain max-h-[70vh] w-auto"
                  priority
                  quality={95}
                />
              </motion.div>
            </div>

            {/* Caption */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-center"
            >
              <h3 id={dialogTitleId} className="text-white text-xl font-serif mb-2">
                {currentImage.alt}
              </h3>
              <p id={dialogDescriptionId} className="text-white/70 text-sm max-w-xl mx-auto mb-1">
                {currentImage.caption}
              </p>
              <p className="text-white/50 text-xs font-mono">
                {new Date(currentImage.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>

              {/* Reactions */}
              <div className="mt-4">
                <Reactions itemId={currentImage.id} variant="dark" />
              </div>
            </motion.div>
          </motion.div>

          {/* Thumbnail Navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 p-2 rounded-xl bg-black/50 backdrop-blur-sm overflow-x-auto max-w-[90vw]">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300 ${
                  idx === currentIndex
                    ? "ring-2 ring-white scale-110"
                    : "opacity-50 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </button>
            ))}
          </div>

          {/* Swipe Hint for Mobile */}
          <div className="md:hidden absolute bottom-20 left-1/2 -translate-x-1/2 text-white/50 text-xs flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Swipe to navigate
            <ChevronRight className="w-4 h-4" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
