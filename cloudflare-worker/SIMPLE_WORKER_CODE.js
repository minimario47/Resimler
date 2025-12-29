// COPY THIS ENTIRE CODE TO YOUR CLOUDFLARE WORKER
// Go to: https://dash.cloudflare.com → Workers & Pages → wedding-photos → Edit code
// Delete everything and paste this code, then click "Save and Deploy"

const R2_URL = 'https://pub-b58e3b0a4909459992b84bd69903e2b7.r2.dev';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Root path - show status
    if (path === '/' || path === '') {
      return new Response('Fotoğraf servisi çalışıyor! ✓', {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
    
    // Get resize parameters
    const width = parseInt(url.searchParams.get('w')) || null;
    const quality = parseInt(url.searchParams.get('q')) || 80;
    const imageUrl = R2_URL + path;
    
    try {
      // Try to resize if width is specified
      if (width) {
        const response = await fetch(imageUrl, {
          cf: {
            image: {
              width: width,
              quality: quality,
              fit: 'scale-down',
              format: 'auto'
            }
          }
        });
        
        if (response.ok) {
          return new Response(response.body, {
            headers: {
              'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
              'Cache-Control': 'public, max-age=31536000, immutable',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }
      
      // Return original image (fallback or no resize requested)
      const response = await fetch(imageUrl);
      return new Response(response.body, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*'
        }
      });
      
    } catch (error) {
      return new Response('Image not found: ' + path, { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
};
