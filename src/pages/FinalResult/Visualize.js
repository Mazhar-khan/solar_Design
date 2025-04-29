export function rgbToColor({ r, g, b }) {
    const f = (x) => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    };
    return `#${f(r)}${f(g)}${f(b)}`;
  }
  
  export function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
  }
  
  export function lerp(x, y, t) {
    return x + t * (y - x);
  }
  
  export function normalize(x, max = 1, min = 0) {
    const y = (x - min) / (max - min);
    return clamp(y, 0, 1);
  }
  
  export function colorToRGB(color) {
    const hex = color.startsWith('#') ? color.slice(1) : color;
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    };
  }
  
  export function createPalette(hexColors) {
    // Map each hex color into an RGB value.
    const rgb = hexColors.map(colorToRGB);
    // Create a palette with 256 colors derived from our rgb colors.
    const size = 256;
    const step = (rgb.length - 1) / (size - 1);
    return Array(size)
      .fill(0)
      .map((_, i) => {
        // Get the lower and upper indices for each color.
        const index = i * step;
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        // Interpolate between the colors to get the shades.
        return {
          r: lerp(rgb[lower].r, rgb[upper].r, index - lower),
          g: lerp(rgb[lower].g, rgb[upper].g, index - lower),
          b: lerp(rgb[lower].b, rgb[upper].b, index - lower),
        };
      });
  }
  
  export function renderPalette({ data, mask, colors, min, max, index }) {
    // First create a palette from a list of hex colors.
    const palette = createPalette(colors ?? ['000000', 'ffffff']);
    // Normalize each value of our raster/band of interest into indices,
    // such that they always map into a value within the palette.
    const indices = data.rasters[index ?? 0]
      .map((x) => normalize(x, max ?? 1, min ?? 0))
      .map((x) => Math.round(x * (palette.length - 1)));
    return renderRGB(
      {
        ...data,
        // Map each index into the corresponding RGB values.
        rasters: [
          indices.map((i) => palette[i].r),
          indices.map((i) => palette[i].g),
          indices.map((i) => palette[i].b),
        ],
      },
      mask
    );
  }
  
  export function renderRGB(rgb, mask) {
    // Create an HTML canvas to draw the image.
    const canvas = document.createElement('canvas');
  
    // Set the canvas size to the mask size if it's available,
    // otherwise set it to the RGB data layer size.
    canvas.width = mask ? mask.width : rgb.width;
    canvas.height = mask ? mask.height : rgb.height;
  
    // Calculate the "delta" between the RGB layer size and the canvas/mask size.
    const dw = rgb.width / canvas.width;
    const dh = rgb.height / canvas.height;
  
    // Get the canvas image data buffer.
    const ctx = canvas.getContext('2d');
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
    // Fill in every pixel in the canvas with the corresponding RGB layer value.
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const rgbIdx = Math.floor(y * dh) * rgb.width + Math.floor(x * dw);
        const maskIdx = y * canvas.width + x;
        const imgIdx = y * canvas.width * 4 + x * 4;
        img.data[imgIdx + 0] = rgb.rasters[0][rgbIdx]; // Red
        img.data[imgIdx + 1] = rgb.rasters[1][rgbIdx]; // Green
        img.data[imgIdx + 2] = rgb.rasters[2][rgbIdx]; // Blue
        img.data[imgIdx + 3] = mask ? mask.rasters[0][maskIdx] * 255 : 255; // Alpha
      }
    }
  
    // Draw the image data buffer into the canvas context.
    ctx.putImageData(img, 0, 0);
    return canvas;
  }
  