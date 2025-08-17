'use client'; /*라우터*/

import { useRouter } from 'next/navigation';

export default function Routing({ src, alt, to }) {
  const router = useRouter();

  return (
    <img
      src={src}
      alt={alt}
      onClick={() => router.push(to)}
      className="cursor-pointer"
      style={{
        position: 'fixed',
        bottom: '50px',
        right: '40px',
        width: '40px',
        height: '40px',
        cursor: 'pointer',
      }}
    />
  );
}
