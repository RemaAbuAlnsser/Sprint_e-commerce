'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { API_URL } from '@/lib/api';

interface SiteInfo {
  site_name: string;
  site_logo: string;
  site_description: string;
  favicon_url: string;
}

export default function DynamicHead() {
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (siteInfo && siteInfo.site_logo && typeof document !== 'undefined' && document.head) {
      // Update favicon dynamically
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
      
      // Add Apple touch icon sizes
      const appleTouchIcon180 = document.createElement('link');
      appleTouchIcon180.rel = 'apple-touch-icon';
      appleTouchIcon180.sizes = '180x180';
      appleTouchIcon180.href = `${API_URL}/apple-touch-icon.png?t=${Date.now()}`;
      document.head.appendChild(appleTouchIcon180);
      
      // Add 32x32 icon
      const icon32 = document.createElement('link');
      icon32.rel = 'icon';
      icon32.type = 'image/png';
      icon32.sizes = '32x32';
      icon32.href = faviconUrl;
      document.head.appendChild(icon32);
      
      // Add 16x16 icon
      const icon16 = document.createElement('link');
      icon16.rel = 'icon';
      icon16.type = 'image/png';
      icon16.sizes = '16x16';
      icon16.href = faviconUrl;
      document.head.appendChild(icon16);
    }
  }, [siteInfo]);

  if (!siteInfo) return null;

  return (
    <Head>
      <title>{siteInfo.site_name || 'Sprint Store'}</title>
      <meta name="description" content={siteInfo.site_description || 'متجر إلكتروني متكامل'} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#5E4A45" />
      
      {/* Open Graph */}
      <meta property="og:title" content={siteInfo.site_name || 'Sprint Store'} />
      <meta property="og:description" content={siteInfo.site_description || 'متجر إلكتروني متكامل'} />
      <meta property="og:type" content="website" />
      {siteInfo.site_logo && (
        <meta property="og:image" content={`${API_URL}${siteInfo.site_logo}`} />
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteInfo.site_name || 'Sprint Store'} />
      <meta name="twitter:description" content={siteInfo.site_description || 'متجر إلكتروني متكامل'} />
      {siteInfo.site_logo && (
        <meta name="twitter:image" content={`${API_URL}${siteInfo.site_logo}`} />
      )}
    </Head>
  );
}
