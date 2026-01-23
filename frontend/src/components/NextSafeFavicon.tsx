'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';

interface SiteInfo {
  site_name: string;
  site_logo: string;
  site_description: string;
}

export default function NextSafeFavicon() {
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);

  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        const response = await fetch(`${API_URL}/site-info`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setSiteInfo(data.data);
          
          // Only update title, avoid favicon manipulation
          if (data.data.site_name && typeof document !== 'undefined') {
            document.title = data.data.site_name;
          }
        }
      } catch (error) {
        console.error('Error fetching site info:', error);
      }
    };

    // Only run once on mount
    fetchSiteInfo();
  }, []);

  // Don't render anything, just handle the side effects
  return null;
}
