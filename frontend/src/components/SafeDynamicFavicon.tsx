'use client';

import { useEffect, useState } from 'react';
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

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

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
    if (!isClient || !siteInfo?.site_logo) return;

    const updateFavicon = () => {
      try {
        // Check if document and head are available
        if (typeof window === 'undefined' || !document?.head) {
          return;
        }

        const faviconUrl = `${API_URL}/favicon.ico?t=${Date.now()}`;
        
        // Remove existing favicon links safely
        const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
        existingFavicons.forEach(link => {
          try {
            if (link && link.parentNode) {
              link.parentNode.removeChild(link);
            }
          } catch (e) {
            // Ignore errors when removing links
            console.debug('Could not remove favicon link:', e);
          }
        });
        
        // Create and add new favicon elements
        const faviconElements = [
          { rel: 'icon', type: 'image/x-icon', href: faviconUrl },
          { rel: 'shortcut icon', type: 'image/x-icon', href: faviconUrl },
          { rel: 'apple-touch-icon', href: `${API_URL}/apple-touch-icon.png?t=${Date.now()}` },
          { rel: 'icon', type: 'image/png', sizes: '32x32', href: faviconUrl },
          { rel: 'icon', type: 'image/png', sizes: '16x16', href: faviconUrl }
        ];

        faviconElements.forEach(config => {
          try {
            const link = document.createElement('link');
            link.rel = config.rel;
            if (config.type) link.type = config.type;
            if (config.sizes) link.sizes = config.sizes;
            link.href = config.href;
            document.head.appendChild(link);
          } catch (e) {
            console.debug('Could not add favicon link:', e);
          }
        });
        
        // Update page title safely
        if (siteInfo.site_name && document.title !== siteInfo.site_name) {
          document.title = siteInfo.site_name;
        }
        
      } catch (error) {
        console.error('Error updating favicon:', error);
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(() => {
      setTimeout(updateFavicon, 100);
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isClient, siteInfo]);

  return null; // This component doesn't render anything
}
