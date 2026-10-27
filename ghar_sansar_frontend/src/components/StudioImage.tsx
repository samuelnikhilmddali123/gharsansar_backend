import React, { useState, useEffect, useRef } from "react";

// Global in-memory cache for processed transparent data URLs
const transparentCache = new Map<string, string>();
const inFlightPromises = new Map<string, Promise<string | null>>();

interface StudioImageProps {
  src: string;
  alt?: string;
  className?: string;
  loading?: "eager" | "lazy";
  style?: React.CSSProperties;
  enableDropShadow?: boolean;
  onLoad?: () => void;
}

/**
 * Removes white/near-white studio background around products using an offscreen canvas
 * with border flood-fill and soft feathering. Leaves internal product elements intact.
 */
function processTransparentImage(src: string): Promise<string | null> {
  if (!src) return Promise.resolve(null);
  if (transparentCache.has(src)) {
    return Promise.resolve(transparentCache.get(src)!);
  }
  if (inFlightPromises.has(src)) {
    return inFlightPromises.get(src)!;
  }

  const promise = new Promise<string | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const naturalWidth = img.naturalWidth || img.width;
        const naturalHeight = img.naturalHeight || img.height;
        if (!naturalWidth || !naturalHeight) {
          resolve(src);
          return;
        }

        // Cap processing size to max 800px for instant sub-10ms processing & sharp Retina quality
        const maxDim = 800;
        let drawWidth = naturalWidth;
        let drawHeight = naturalHeight;
        if (drawWidth > maxDim || drawHeight > maxDim) {
          const ratio = Math.min(maxDim / drawWidth, maxDim / drawHeight);
          drawWidth = Math.round(drawWidth * ratio);
          drawHeight = Math.round(drawHeight * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = drawWidth;
        canvas.height = drawHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
        const imgData = ctx.getImageData(0, 0, drawWidth, drawHeight);
        const data = imgData.data;
        const totalPixels = drawWidth * drawHeight;

        // Sample the 4 corners to check if already transparent or has white background
        const cornerIndices = [
          0,
          (drawWidth - 1) * 4,
          (drawHeight - 1) * drawWidth * 4,
          ((drawHeight - 1) * drawWidth + (drawWidth - 1)) * 4,
        ];

        let hasTransparency = false;
        let whiteCorners = 0;

        for (const idx of cornerIndices) {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          if (a < 50) {
            hasTransparency = true;
            break;
          }
          if (r >= 230 && g >= 230 && b >= 228) {
            whiteCorners++;
          }
        }

        // If corners are already transparent, no background removal needed
        if (hasTransparency) {
          transparentCache.set(src, src);
          resolve(src);
          return;
        }

        // If image doesn't have white background around borders, keep original
        if (whiteCorners < 2) {
          transparentCache.set(src, src);
          resolve(src);
          return;
        }

        // Flood-fill BFS from all four borders to remove only outer white canvas
        const visited = new Uint8Array(totalPixels);
        const queue = new Int32Array(totalPixels);
        let head = 0;
        let tail = 0;

        const isBgColor = (r: number, g: number, b: number) => {
          return r >= 230 && g >= 230 && b >= 226;
        };

        const pushPixel = (x: number, y: number) => {
          const idx = y * drawWidth + x;
          if (visited[idx]) return;
          const p = idx * 4;
          if (isBgColor(data[p], data[p + 1], data[p + 2])) {
            visited[idx] = 1;
            queue[tail++] = idx;
          }
        };

        // Seed top and bottom borders
        for (let x = 0; x < drawWidth; x++) {
          pushPixel(x, 0);
          pushPixel(x, drawHeight - 1);
        }
        // Seed left and right borders
        for (let y = 0; y < drawHeight; y++) {
          pushPixel(0, y);
          pushPixel(drawWidth - 1, y);
        }

        // Execute flood fill
        while (head < tail) {
          const curr = queue[head++];
          const cx = curr % drawWidth;
          const cy = (curr / drawWidth) | 0;

          if (cx > 0) pushPixel(cx - 1, cy);
          if (cx < drawWidth - 1) pushPixel(cx + 1, cy);
          if (cy > 0) pushPixel(cx, cy - 1);
          if (cy < drawHeight - 1) pushPixel(cx, cy + 1);
        }

        // Apply transparency with edge anti-aliasing feathering
        for (let i = 0; i < totalPixels; i++) {
          if (visited[i]) {
            const p = i * 4;
            const minC = Math.min(data[p], data[p + 1], data[p + 2]);
            if (minC >= 244) {
              data[p + 3] = 0; // 100% transparent
            } else {
              // Smooth feathering across boundary pixels
              const factor = Math.max(0, Math.min(1, (244 - minC) / 14));
              data[p + 3] = Math.round(255 * factor);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        // Use webp data URL with high fidelity, fallback to png if unsupported
        let dataUrl: string;
        try {
          dataUrl = canvas.toDataURL("image/webp", 0.94);
          if (!dataUrl.startsWith("data:image/webp")) {
            dataUrl = canvas.toDataURL("image/png");
          }
        } catch {
          dataUrl = canvas.toDataURL("image/png");
        }

        transparentCache.set(src, dataUrl);
        resolve(dataUrl);
      } catch (err) {
        // Fallback gracefully on CORS/SecurityError
        transparentCache.set(src, src);
        resolve(src);
      }
    };

    img.onerror = () => {
      resolve(src);
    };

    img.src = src;
  });

  inFlightPromises.set(src, promise);
  return promise;
}

export const StudioImage: React.FC<StudioImageProps> = ({
  src,
  alt = "Product",
  className = "",
  loading = "lazy",
  style,
  enableDropShadow = true,
  onLoad,
}) => {
  const [displaySrc, setDisplaySrc] = useState<string>(() => {
    return transparentCache.get(src) || src;
  });
  const [isTransparent, setIsTransparent] = useState<boolean>(() => {
    const cached = transparentCache.get(src);
    return Boolean(cached && cached !== src);
  });

  useEffect(() => {
    let isMounted = true;
    if (!src) return;

    if (transparentCache.has(src)) {
      const cached = transparentCache.get(src)!;
      setDisplaySrc(cached);
      setIsTransparent(cached !== src || cached.startsWith("data:image"));
      return;
    }

    // Process in background
    processTransparentImage(src).then((result) => {
      if (!isMounted) return;
      if (result) {
        setDisplaySrc(result);
        setIsTransparent(result !== src || result.startsWith("data:image"));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [src]);

  // Combined drop-shadow conforming to product silhouette
  const shadowFilter = enableDropShadow
    ? "drop-shadow(0 10px 14px rgba(35, 45, 38, 0.07)) drop-shadow(0 2px 4px rgba(35, 45, 38, 0.04))"
    : undefined;

  return (
    <img
      src={displaySrc}
      alt={alt}
      loading={loading}
      onLoad={onLoad}
      className={`object-contain ${className}`}
      style={{
        ...style,
        // When not yet masked or if fallback, mix-blend-multiply ensures pure white becomes exact #F7F6F0
        mixBlendMode: isTransparent ? "normal" : "multiply",
        filter: isTransparent ? shadowFilter : (style?.filter || undefined),
      }}
    />
  );
};

export default StudioImage;
