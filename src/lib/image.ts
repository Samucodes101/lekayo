// Utility for applying Cloudinary transformations to hosted images.
// Returns non-Cloudinary sources (e.g. data URIs, unsplash) unchanged so
// this is safe to call on any hero/banner URL without side effects.

export interface CloudinaryTransformOptions {
  width: number
  height: number
}

export function cloudinaryTransform(
  src: string | null | undefined,
  { width, height }: CloudinaryTransformOptions,
): string {
  if (!src) return ""
  if (!src.includes("res.cloudinary.com")) return src
  if (src.startsWith("data:")) return src

  // c_fill  -> crop to fill the requested box
  // g_auto  -> smart gravity keeps the primary subject in frame
  // f_auto  -> serve the most efficient format
  // q_auto  -> optimize quality automatically
  const transform = `c_fill,g_auto,w_${width},h_${height},f_auto,q_auto`

  // Inject the transformation after the /upload/ segment of the URL.
  return src.replace("/upload/", `/upload/${transform}/`)
}