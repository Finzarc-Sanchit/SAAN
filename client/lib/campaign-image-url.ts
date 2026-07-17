/**
 * Speeds up Cloudinary campaign assets by requesting a sized, auto-format URL
 * from the CDN edge — skips the slower Next Image proxy round-trip.
 */
export function optimizeCampaignImageUrl(url: string, width: number): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'res.cloudinary.com') {
      return url;
    }

    const uploadToken = '/upload/';
    const uploadIndex = parsed.pathname.indexOf(uploadToken);
    if (uploadIndex === -1) {
      return url;
    }

    let pathAfter = parsed.pathname.slice(uploadIndex + uploadToken.length);
    const firstSegment = pathAfter.split('/')[0] ?? '';

    // Drop an existing transform segment (e.g. `w_800,q_auto`) before re-applying.
    if (firstSegment && /[_:,]/.test(firstSegment) && !/^v\d+$/.test(firstSegment)) {
      pathAfter = pathAfter.slice(firstSegment.length + 1);
    }

    const transform = `f_auto,q_auto:eco,c_limit,w_${Math.round(width)}`;
    parsed.pathname = `${parsed.pathname.slice(0, uploadIndex + uploadToken.length)}${transform}/${pathAfter}`;
    return parsed.toString();
  } catch {
    return url;
  }
}

export function isCloudinaryImageUrl(url: string): boolean {
  try {
    return new URL(url).hostname === 'res.cloudinary.com';
  } catch {
    return false;
  }
}
