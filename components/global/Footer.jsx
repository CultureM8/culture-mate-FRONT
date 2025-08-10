"use client"

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES, IMAGES, ICONS } from '@/constants/path';

// 소셜 미디어 아이콘 컴포넌트
const SocialIcons = () => {
  const socialLinks = [
    { name: 'facebook', icon: ICONS.FACEBOOK, path: ROUTES.FACEBOOK },
    { name: 'instagram', icon: ICONS.INSTAGRAM, path: ROUTES.INSTAGRAM },
    { name: 'youtube', icon: ICONS.YOUTUBE, path: ROUTES.YOUTUBE },
    { name: 'kakaotalk', icon: ICONS.KAKAOTALK, path: ROUTES.KAKAOTALK }
  ];

  return (
    <div className="flex gap-4">
      {socialLinks.map((social) => (
        <Link
          key={social.name}
          href={social.path}
          className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          aria-label={social.name}
        >
          <Image
            src={social.icon}
            alt={social.name}
            width={24}
            height={24}
            className="object-contain"
          />
        </Link>
      ))}
    </div>
  );
};

// 정책 링크 컴포넌트
const PolicyLinks = () => {
  const policies = [
    { name: '이용약관', path: ROUTES.TERMS },
    { name: '개인정보처리방침', path: ROUTES.PRIVACY },
    { name: '위치기반서비스 이용약관', path: ROUTES.LOCATION_TERMS },
    { name: '청소년보호정책', path: ROUTES.YOUTH_PROTECTION },
    { name: '이메일무단수집거부', path: ROUTES.EMAIL_POLICY }
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      {policies.map((policy, index) => (
        <React.Fragment key={policy.name}>
          <Link
            href={policy.path}
            className="px-4 py-2 text-black hover:text-gray-600 transition-colors whitespace-nowrap flex items-center"
            style={{ height: '16px' }}
          >
            {policy.name}
          </Link>
          {index < policies.length - 1 && (
            <span className="border-l border-black" style={{ height: '16px' }}></span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// 메뉴 섹션 컴포넌트
const MenuSection = ({ title, items }) => (
  <div className="flex flex-col">
    <h3 className="font-bold text-base text-black mb-4 px-4">{title}</h3>
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.name}>
          <Link
            href={item.path}
            className="block px-4 py-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

// 회사 정보 컴포넌트
const CompanyInfo = () => (
  <div className="text-xs text-gray-400 leading-relaxed space-y-1">
    <p>(주)컬쳐메이트</p>
    <p>대표 : 홍길동 | 개인정보관리책임자 : 홍길동</p>
    <p>사업자등록번호: 111-22-33333</p>
    <p>주소: 서울 노원구 상계로1길 34 세일학원 5층</p>
    <p>이메일 : culturemate@gmail.com</p>
    <p>대표번호 : 070-1234-5678</p>
    <p>통신판매업신고: 제 2025-서울노원-12345</p>
    <p className="mt-2">© CultureMate Inc. All Rights Reserved</p>
  </div>
);

// 메인 Footer 컴포넌트
const Footer = () => {
  const companyMenuItems = [
    { name: '서비스 소개', path: ROUTES.ABOUT },
    { name: '이용 가이드', path: ROUTES.GUIDE },
    { name: '공지사항', path: ROUTES.NOTICE }
  ];

  const supportMenuItems = [
    { name: 'FAQ', path: ROUTES.FAQ },
    { name: '1:1 문의하기', path: ROUTES.CONTACT }
  ];

  return (
    <footer className="w-full bg-white min-h-[280px] flex flex-col">
      {/* 구분선 */}
      <div className="w-full h-px bg-gray-200"></div>

      {/* 본문 영역 - 반응형 */}
      <div className="flex-1 flex items-end justify-center">
        <div className="w-full max-w-[1200px] px-4 pb-5 pt-10">
          {/* 메인 콘텐츠 영역 */}
          <div className="flex flex-col lg:flex-row justify-between gap-8 mb-6">
            {/* 왼쪽: 메뉴 섹션들 */}
            <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
              <MenuSection
                title="컬쳐메이트 안내"
                items={companyMenuItems}
              />
              <MenuSection
                title="고객지원"
                items={supportMenuItems}
              />
            </div>

            {/* 오른쪽: 회사 정보 */}
            <div className="flex flex-col lg:items-end">
              <CompanyInfo />
            </div>
          </div>

          {/* 하단: 정책 링크와 소셜 아이콘 */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <PolicyLinks />
            <div className="flex justify-center md:justify-end">
              <SocialIcons />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;