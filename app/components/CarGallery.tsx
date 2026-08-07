"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type GalleryImage = {
  src: string;
  alt: string;
};

export default function CarGallery({
  title,
  images,
}: {
  title: string;
  images: GalleryImage[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  const hasMultipleImages = images.length > 1;

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }, [images.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
      if (event.key === "ArrowLeft" && hasMultipleImages) showPrevious();
      if (event.key === "ArrowRight" && hasMultipleImages) showNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasMultipleImages, isOpen, showNext, showPrevious]);

  const openGallery = () => {
    setActiveIndex(0);
    setIsOpen(true);
  };

  return (
    <div className="side-gallery">
      <p className="eyebrow"><span /> Galeria do proprietário</p>
      <button
        className="gallery-trigger"
        onClick={openGallery}
        style={{ backgroundImage: `url(${images[0].src})` }}
        type="button"
      >
        <span>Abrir galeria</span>
      </button>

      {isOpen && (
        <div
          className="gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Galeria de ${title}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <div className="gallery-modal-inner">
            <div className="gallery-modal-header">
              <div><small>Galeria do proprietário</small><strong>{title}</strong></div>
              <span>{activeIndex + 1} / {images.length}</span>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Fechar galeria">×</button>
            </div>

            <div
              className="gallery-stage"
              onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
              onTouchEnd={(event) => {
                if (touchStart.current === null || !hasMultipleImages) return;
                const distance = event.changedTouches[0].clientX - touchStart.current;
                if (Math.abs(distance) > 45) {
                  if (distance > 0) showPrevious();
                  else showNext();
                }
                touchStart.current = null;
              }}
            >
              <div className="gallery-image-frame">
                <Image src={images[activeIndex].src} alt={images[activeIndex].alt} fill sizes="100vw" priority />
              </div>
              {hasMultipleImages && (
                <>
                  <button className="gallery-arrow previous" type="button" onClick={showPrevious} aria-label="Fotografia anterior">←</button>
                  <button className="gallery-arrow next" type="button" onClick={showNext} aria-label="Fotografia seguinte">→</button>
                </>
              )}
            </div>

            {hasMultipleImages && (
              <div className="gallery-thumbnails" aria-label="Selecionar fotografia">
                {images.map((image, index) => (
                  <button
                    className={index === activeIndex ? "active" : ""}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Ver fotografia ${index + 1}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                    key={`${image.src}-${index}`}
                  >
                    <Image src={image.src} alt="" fill sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
