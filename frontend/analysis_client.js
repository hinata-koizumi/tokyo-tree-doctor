// analysis_client.js
// Helper to send image to backend analysis API and draw polygons on leaflet map.

import axios from 'axios';

/**
 * Send image and metadata to backend and draw returned polygons.
 * @param {File|Blob} imageFile - image file captured by user/drone.
 * @param {L.Map} map - leaflet map instance.
 * @param {Object} options - meta and styling.
 * @returns {Promise<void>}
 */
export async function analyzeAndDraw(imageFile, map, options = {}) {
  const {
    gsd_m_per_px = 0.05,
    yaw_deg = 0.0,
    tile_side_m = 20.0,
    apiBase = '/api/v1/analysis',
  } = options;

  const b64 = await _fileToBase64(imageFile);

  const payload = {
    image_b64: b64.split(',')[1] || b64, // remove data:image...;base64,
    meta: {
      gsd_m_per_px,
      yaw_deg,
      tile_side_m,
    },
  };

  const res = await axios.post(`${apiBase}/analyze_area`, payload);
  const { tiles } = res.data;

  tiles.forEach((tile) => {
    const latlngs = tile.polygon.map(([x, y]) => map.containerPointToLatLng([x, y]));
    let color;
    switch (tile.class_label) {
      case '危険':
        color = '#dc2626';
        break;
      case '要注意':
        color = '#f59e0b';
        break;
      case '健康':
      case '健全':
        color = '#10b981';
        break;
      default:
        color = '#6b7280';
    }
    L.polygon(latlngs, { color, weight: 2, fillOpacity: 0.2 }).addTo(map);
  });
}

function _fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
