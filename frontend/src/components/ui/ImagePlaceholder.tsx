import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { ImageIcon } from "lucide-react";

import { optimizeCloudinaryUrl } from "../../utils/image";

interface ImagePlaceholderProps {
  /** Pass the imported local asset (or a remote URL) once the real image exists. Leave undefined to show the placeholder. */
  src?: string;
  alt: string;
  className?: string;
  icon?: ComponentType<LucideProps>;
  iconSize?: number;
  fit?: "cover" | "contain";
  /** Intrinsic dimensions used as a layout hint to prevent CLS. Rendered size is still controlled by `className`. */
  width?: number;
  height?: number;
}

/**
 * Renders a real `<img>` (lazy-loaded, async-decoded, object-fit applied) when `src` is provided.
 * Falls back to a soft branded gradient block with an icon when no asset is available yet,
 * so layouts stay production-ready before real photography is dropped into `src/assets/images/`.
 */
const ImagePlaceholder = ({
  src,
  alt,
  className = "",
  icon: Icon = ImageIcon,
  iconSize = 40,
  fit = "cover",
  width = 1200,
  height = 800,
}: ImagePlaceholderProps) => {
  if (src) {
    return (
      <img
        src={optimizeCloudinaryUrl(src)}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={`${fit === "cover" ? "object-cover" : "object-contain"} ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 ${className}`}
    >
      <Icon size={iconSize} strokeWidth={1.5} className="text-blue-200" />
    </div>
  );
};

export default ImagePlaceholder;
