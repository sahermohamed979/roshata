import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'روشتة — نظام إدارة وطباعة الروشتات الطبية',
    short_name: 'روشتة',
    description: 'المنصة الطبية المستقلة لإدارة وتحرير وطباعة الروشتات بدون إنترنت للأطباء والعيادات',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#F8FAFC',
    theme_color: '#0B7B5E',
    lang: 'ar',
    dir: 'rtl',
    categories: ['medical', 'productivity', 'health'],
    icons: [
      {
        src: '/app-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
