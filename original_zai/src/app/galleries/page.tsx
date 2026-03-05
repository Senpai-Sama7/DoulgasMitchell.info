"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/main-layout";
import { ImageCard } from "@/components/image-card";
import { Lightbox } from "@/components/lightbox";
import { galleryImages, seriesInfo } from "@/lib/data";
import { useLightboxStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type SeriesKey = "recent-post" | "tech-deck" | "project";

export default function GalleriesPage() {
  const [activeSeries, setActiveSeries] = useState<SeriesKey | "all">("all");
  const { open, setCurrentIndex } = useLightboxStore();

  // Filter images by series
  const filteredImages = useMemo(() => {
    if (activeSeries === "all") {
      return galleryImages;
    }
    return galleryImages.filter((img) => img.series === activeSeries);
  }, [activeSeries]);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    open(index);
  };

  const tabs: { key: SeriesKey | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "recent-post", label: "Recent" },
    { key: "tech-deck", label: "Tech" },
    { key: "project", label: "Projects" },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-6 md:py-8"
        >
          <h1 className="font-serif text-3xl md:text-4xl mb-2">
            Galleries
          </h1>
          <p className="text-sm text-muted-foreground">
            Visual narratives at the intersection of architecture, technology, and creative expression.
          </p>
        </motion.header>

        {/* Series Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSeries(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
                activeSeries === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent hover:bg-accent/80"
              )}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <motion.div layout className="gallery-grid">
          {filteredImages.map((image, index) => (
            <ImageCard
              key={image.id}
              image={image}
              index={index}
              onImageClick={handleImageClick}
            />
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-4 mt-8 py-6 border-t border-border"
        >
          <div className="text-center">
            <p className="font-serif text-2xl md:text-3xl font-bold text-primary">
              {galleryImages.length}
            </p>
            <p className="text-xs text-muted-foreground">Works</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-2xl md:text-3xl font-bold text-primary">3</p>
            <p className="text-xs text-muted-foreground">Series</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-2xl md:text-3xl font-bold text-primary">4+</p>
            <p className="text-xs text-muted-foreground">Years</p>
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      <Lightbox images={filteredImages} />
    </MainLayout>
  );
}
