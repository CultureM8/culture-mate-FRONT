'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export default function useFullPath() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return useMemo(() => {
    const q = searchParams?.toString();
    return q ? `${pathname}?${q}` : pathname;
  }, [pathname, searchParams]);
}
