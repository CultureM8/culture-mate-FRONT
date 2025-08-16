/*홍보 카드형*/
import Image from 'next/image';
import Gallery from '@/components/global/Gallery';
import { ICONS } from '@/constants/path';

export default function PromoteGallery({ post, card, ...props }) {
  /* Gallery에 전달할 props 구성*/
  const galleryProps = {
    src: card?.eventImage || '/img/default_img.svg',
    alt: card?.eventName || post?.title || '이벤트 이미지',
    title: card?.eventName || post?.title || '이벤트명',
    href: `/community/promote/${post.id}`,
    enableInterest: true,
    /*  onClick: () => {
     관심 버튼 클릭 시 로직 (추후 구현)
      console.log('관심 표시:', post.id);
    },
    ...props,*/
  };

  /*dl벤트 정보 추출*/
  const eventDate = card?.date || post?.eventDate || '0000.00.00 ~ 0000.00.00';
  const location = card?.location || post?.location || '지역 및 장소명';
  const isHot = card?.isHot || post?.isHot || false;

  return (
    <Gallery {...galleryProps}>
      {/* 이벤트 날짜 */}
      <div className="text-xs text-gray-600 mb-1">{eventDate}</div>

      {/* 별점 정보 */}
      <div className="flex items-center gap-1 mb-2">
        <Image
          src="/img/star_full.svg"
          alt="star rating"
          width={16}
          height={16}
        />
        <span className="text-sm font-medium">
          {Number(card?.starScore || 0).toFixed(1)}
        </span>
      </div>

      {/* 설명 (최대 2줄) */}
      <div className="text-gray-600 text-xs leading-relaxed line-clamp-2 mb-2">
        {card?.description ||
          (post?.content || '').slice(0, 80) ||
          '이벤트 설명'}
      </div>

      {/* 위치 및 인기 표시 */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        {isHot && (
          <div className="flex items-center gap-1 text-red-500 font-medium mr-2">
            인기
            <Image src={ICONS.FIRE} alt="인기" width={16} height={16} />
          </div>
        )}
        <span>{location}</span>
      </div>
    </Gallery>
  );
}
