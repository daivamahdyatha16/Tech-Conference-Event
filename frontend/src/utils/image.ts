/**
 * Cloudinary serves the original file format/quality by default. Injecting
 * `f_auto,q_auto` into the delivery URL asks Cloudinary to negotiate the best
 * format per-browser (WebP/AVIF where supported) and the best quality/size
 * trade-off, with zero local conversion or extra build tooling required.
 * Non-Cloudinary URLs (e.g. bundled local assets) are returned unchanged.
 */
export const optimizeCloudinaryUrl = (url: string) => {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  if (url.includes("/upload/f_auto")) {
    return url;
  }

  return url.replace("/upload/", "/upload/f_auto,q_auto/");
};
