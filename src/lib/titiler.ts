/**
 * Build a TiTiler tile URL from a scene identifier.
 *
 * In production, TiTiler serves COG tiles from S3/cloud storage:
 *   https://{tihoster}/tiles/{scene_id}/{z}/{x}/{y}.png
 *
 * For Sentinel Hub or custom backends, swap the base URL.
 */

const TITILER_BASE =
  import.meta.env.VITE_TITILER_URL || "https://tiles.example.com";

export function buildTiTilerUrl(sceneId: string): string {
  return `${TITILER_BASE}/tiles/${sceneId}/{z}/{x}/{y}.png`;
}
