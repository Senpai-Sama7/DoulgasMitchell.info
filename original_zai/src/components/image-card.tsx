"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { GalleryImage } from "@/lib/data";
import { Reactions } from "./reactions";

interface ImageCardProps {
  image: GalleryImage;
  index: number;
  onImageClick: (index: number) => void;
}

export function ImageCard({ image, index, onImageClick }: ImageCardProps) {
  // Determine card size based on index pattern
  const getCardSize = () => {
    const pattern = index % 6;
    switch (pattern) {
      case 0:
        return "gallery-item-lg";
      case 1:
        return "gallery-item-md";
      case 2:
        return "gallery-item-sm";
      case 3:
        return "gallery-item-md";
      case 4:
        return "gallery-item-sm";
      case 5:
        return "gallery-item-lg";
      default:
        return "gallery-item-sm";
    }
  };

  const isPortrait = image.height > image.width;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.05 }}
      className={`${getCardSize()} group`}
    >
      <div
        onClick={() => onImageClick(index)}
        className="image-card h-full w-full relative"
      >
        <div
          className={`relative w-full ${
            isPortrait ? "h-full min-h-[200px] md:min-h-[280px]" : "h-full min-h-[160px] md:min-h-[200px]"
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white font-serif text-sm mb-0.5">{image.alt}</h3>
            <p className="text-white/70 text-xs line-clamp-1">{image.caption}</p>
          </div>
        </div>

        {/* Reactions - shown on hover */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div onClick={(e) => e.stopPropagation()}>
            <Reactions itemId={image.id} variant="dark" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
