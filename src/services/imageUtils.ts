// src/services/imageUtils.ts

/**
 * Returns a valid image URL for company logos, only allowing Cloudinary or placeholder URLs.
 * @param logoPath The path or URL of the logo.
 */
export function getCompanyLogoUrl(logoPath?: string): string {
  if (!logoPath) return '/default-profile.png';
  if (logoPath.startsWith('http')) return logoPath;
  // Never return localhost or /uploads, only Cloudinary or placeholder
  return '/default-profile.png';
}

/**
 * Returns a valid image URL for user profile images, only allowing Cloudinary or placeholder URLs.
 * @param fotoPerfil The path or URL of the profile image.
 */
export function getUserImageUrl(fotoPerfil?: string): string {
  if (!fotoPerfil) return '/default-profile.png';
  if (fotoPerfil.startsWith('http')) return fotoPerfil;
  return '/default-profile.png';
}

/**
 * Returns a valid image URL for project images, only allowing Cloudinary or placeholder URLs.
 * @param imgPath The path or URL of the project image.
 */
export function getProjectImageUrl(imgPath?: string): string {
  if (!imgPath) return '/default-profile.png';
  if (imgPath.startsWith('http')) return imgPath;
  return '/default-profile.png';
}
