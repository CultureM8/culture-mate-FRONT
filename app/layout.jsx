import { Suspense } from 'react';
import LoginProvider from '@/components/auth/LoginProvider';
import NavigationBar from '@/components/global/NavigationBar';
import Footer from '@/components/global/Footer';
import './globals.css';

export const metadata = {
  title: {
    default: '컬쳐메이트 - CultureM8',
    template: '%s | 컬쳐메이트'
  },
  description: '좋아하는 전시, 공연, 페스티벌을 찾아보고 함께 즐길 친구를 만나보세요.',
  keywords: ['전시', '공연', '페스티벌', '축제', '뮤지컬', '연극', '콘서트', '미술관', '갤러리', '문화', '문화생활', '친구', '동행', '메이트', '같이', '함께', '소모임', '모임', '만남', '커뮤니티', '취미', '리뷰', '추천', '컬쳐메이트'],
  authors: [{ name: 'CultureM8' }],
  creator: 'CultureM8',
  publisher: 'CultureM8',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    
    url: 'https://culturemate.khoon.kr',

    title: '컬쳐메이트 - CultureM8',
    description: '좋아하는 전시, 공연, 페스티벌을 찾아보고 함께 즐길 친구를 만나보세요',
    siteName: '컬쳐메이트',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <LoginProvider>
          <Suspense fallback={<div />}>
            <NavigationBar />
          </Suspense>
          {children}
          <Footer />
        </LoginProvider>
      </body>
    </html>
  );
}
