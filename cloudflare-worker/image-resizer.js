/**
 * Cloudflare Worker for Image Resizing
 * 
 * This worker sits in front of your R2 bucket and resizes images on-the-fly.
 * 
 * Usage: https://your-worker.workers.dev/photo.jpg?w=400&q=75
 * 
 * Parameters:
 *   w = width (default: original)
 *   q = quality 1-100 (default: 80)
 *   fit = cover, contain, scale-down (default: scale-down)
 */

// Your R2 bucket public URL
const R2_PUBLIC_URL = 'https://pub-b58e3b0a4909459992b84bd69903e2b7.r2.dev';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Get image path (everything after the worker URL)
    const imagePath = url.pathname;
    
    // If no path, return instructions
    if (imagePath === '/' || imagePath === '') {
      return new Response('Image Resizer Worker\n\nUsage: /image.jpg?w=400&q=75', {
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Parse resize parameters
    const width = parseInt(url.searchParams.get('w')) || null;
    const quality = parseInt(url.searchParams.get('q')) || 80;
    const fit = url.searchParams.get('fit') || 'scale-down';
    
    // Build the original image URL
    const imageUrl = `${R2_PUBLIC_URL}${imagePath}`;
    
    // If no resize needed, just proxy the original
    if (!width) {
      const response = await fetch(imageUrl);
      return new Response(response.body, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
    
    // Use Cloudflare Image Resizing
    // This is available on all Cloudflare plans when using Workers
    try {
      const resizedResponse = await fetch(imageUrl, {
        cf: {
          image: {
            width: width,
            quality: quality,
            fit: fit,
            format: 'auto', // Automatically serve WebP/AVIF if browser supports
          }
        }
      });
      
      // Check if resizing worked
      if (resizedResponse.ok) {
        return new Response(resizedResponse.body, {
          headers: {
            'Content-Type': resizedResponse.headers.get('Content-Type') || 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*',
            'X-Resized': 'true',
          }
        });
      }
      
      // Fallback to original if resizing fails
      const fallback = await fetch(imageUrl);
      return new Response(fallback.body, {
        headers: {
          'Content-Type': fallback.headers.get('Content-Type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
          'X-Resized': 'false',
        }
      });
      
    } catch (error) {
      // If image resizing is not available, return original
      const response = await fetch(imageUrl);
      return new Response(response.body, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  }
};
