'use client';

import { useEffect, useState, useRef } from 'react';
import { API_URL } from '@/lib/api';

interface SiteInfo {
  site_name: string;
  site_logo: string;
  site_description: string;
  favicon_url: string;
}

export default function SafeDynamicFavicon() {
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [isClient, setIsClient] = useState(false);
  const hasUpdated = useRef(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || hasUpdated.current) return;

    const fetchSiteInfo = async () => {
      try {
        const response = await fetch(`${API_URL}/site-info`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setSiteInfo(data.data);
        }
      } catch (error) {
        console.error('Error fetching site info:', error);
      }
    };

    fetchSiteInfo();
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !siteInfo?.site_logo || hasUpdated.current) return;

    const updateFavicon = () => {
      try {
        // Multiple safety checks
        if (typeof window === 'undefined') return;
        if (typeof document === 'undefined') return;
        if (!document.head) return;

        const faviconUrl = `${API_URL}/favicon.ico?t=${Date.now()}`;
        
        // Safer way to remove existing favicons
        try {
          const existingFavicons = Array.from(document.querySelectorAll('link[rel*="icon"]'));
          existingFavicons.forEach(link => {
            try {
              if (link && link.parentElement && link.parentElement.contains(link)) {
                link.parentElement.removeChild(link);
              }
            } catch (removeError) {
              // Silently ignore removal errors
            }
          });
        } catch (queryError) {
          // Silently ignore query errors
        }
        
        // Create and add new favicon elements with error handling
        const faviconConfigs = [
          { rel: 'icon', type: 'image/x-icon', href: faviconUrl },
          { rel: 'shortcut icon', type: 'image/x-icon', href: faviconUrl },
          { rel: 'apple-touch-icon', href: `${API_URL}/apple-touch-icon.png?t=${Date.now()}` }
        ];

        faviconConfigs.forEach(config => {
          try {
            if (!document.head) return;
            
            const link = document.createElement('link');
            link.rel = config.rel;
            if (config.type) link.type = config.type;
            link.href = config.href;
            
            // Additional safety check before appending
            if (document.head && document.head.appendChild) {
              document.head.appendChild(link);
            }
          } catch (createError) {
            // Silently ignore creation errors
          }
        });
        
        // Update page title safely
        try {
          if (siteInfo.site_name && document.title !== siteInfo.site_name) {
            document.title = siteInfo.site_name;
          }
        } catch (titleError) {
          // Silently ignore title update errors
        }
        
        hasUpdated.current = true;
        
      } catch (error) {
        // Silently handle all errors to prevent crashes
        console.debug('Favicon update error (safely handled):', error);
      }
    };

    // Multiple layers of safety for DOM readiness
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateFavicon, { once: true });
    } else {
      // Use multiple async methods to ensure DOM is ready
      const timeoutId = setTimeout(updateFavicon, 200);
      const rafId = requestAnimationFrame(() => {
        setTimeout(updateFavicon, 100);
      });

      return () => {
        clearTimeout(timeoutId);
        cancelAnimationFrame(rafId);
      };
    }
  }, [isClient, siteInfo]);

  return null; // This component doesn't render anything
}
