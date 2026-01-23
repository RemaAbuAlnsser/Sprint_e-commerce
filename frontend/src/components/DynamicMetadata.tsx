'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';

interface SiteInfo {
  site_name: string;
  site_logo: string;
  site_description: string;
  favicon_url: string;
}

export default function DynamicMetadata() {
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
    if (!isClient || !siteInfo) return;

    const updateMetadata = () => {
      try {
        // Check if document is available
        if (typeof window === 'undefined' || !document) {
          return;
        }

        // Update page title safely
        if (siteInfo.site_name && document.title !== siteInfo.site_name) {
          document.title = siteInfo.site_name;
        }

        // Update or create meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head?.appendChild(metaDescription);
        }
        if (siteInfo.site_description) {
          metaDescription.setAttribute('content', siteInfo.site_description);
        }

        // Update or create Open Graph meta tags
        const ogTags = [
          { property: 'og:title', content: siteInfo.site_name },
          { property: 'og:description', content: siteInfo.site_description },
          { property: 'og:type', content: 'website' },
          { property: 'og:image', content: siteInfo.site_logo ? `${API_URL}${siteInfo.site_logo}` : '' }
        ];

        ogTags.forEach(tag => {
          if (!tag.content) return;
          
          let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
          if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.setAttribute('property', tag.property);
            document.head?.appendChild(metaTag);
          }
          metaTag.setAttribute('content', tag.content);
        });

        // Update or create Twitter Card meta tags
        const twitterTags = [
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: siteInfo.site_name },
          { name: 'twitter:description', content: siteInfo.site_description },
          { name: 'twitter:image', content: siteInfo.site_logo ? `${API_URL}${siteInfo.site_logo}` : '' }
        ];

        twitterTags.forEach(tag => {
          if (!tag.content) return;
          
          let metaTag = document.querySelector(`meta[name="${tag.name}"]`);
          if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.setAttribute('name', tag.name);
            document.head?.appendChild(metaTag);
          }
          metaTag.setAttribute('content', tag.content);
        });

      } catch (error) {
        console.error('Error updating metadata:', error);
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(() => {
      setTimeout(updateMetadata, 100);
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isClient, siteInfo]);

  return null; // This component doesn't render anything
}
