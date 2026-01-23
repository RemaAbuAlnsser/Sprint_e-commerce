'use client';

import { useEffect } from 'react';
import { API_URL } from '@/lib/api';

export default function DynamicFavicon() {
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        // Check if document is ready
        if (typeof document === 'undefined' || !document.head) {
          return;
        }

        const response = await fetch(`${API_URL}/site-info`);
        const data = await response.json();
        
        if (data.success && data.data.site_logo) {
          // Update favicon
          const faviconUrl = `${API_URL}/favicon.ico?t=${Date.now()}`;
          
          // Remove existing favicon links safely
          const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
          existingFavicons.forEach(link => {
            if (link.parentNode) {
              link.parentNode.removeChild(link);
            }
          });
          
          // Add new favicon
          const favicon = document.createElement('link');
          favicon.rel = 'icon';
          favicon.type = 'image/x-icon';
          favicon.href = faviconUrl;
          document.head.appendChild(favicon);
          
          // Add shortcut icon
          const shortcutIcon = document.createElement('link');
          shortcutIcon.rel = 'shortcut icon';
          shortcutIcon.type = 'image/x-icon';
          shortcutIcon.href = faviconUrl;
          document.head.appendChild(shortcutIcon);
          
          // Add Apple touch icon
          const appleTouchIcon = document.createElement('link');
          appleTouchIcon.rel = 'apple-touch-icon';
          appleTouchIcon.href = `${API_URL}/apple-touch-icon.png?t=${Date.now()}`;
          document.head.appendChild(appleTouchIcon);
          
          // Update page title if available
          if (data.data.site_name) {
            document.title = data.data.site_name;
          }
        }
      } catch (error) {
        console.error('Error updating favicon:', error);
      }
    };

    // Delay execution to ensure DOM is ready
    const timer = setTimeout(updateFavicon, 100);
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}
