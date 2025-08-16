/*카드형*/
import Image from 'next/image';
import Gallery from '@/components/global/Gallery';

export default function CommunityGallery({
  imgSrc,
  alt,
  title = '이벤트명',
  rating = 0,
  content = '이벤트 후기 내용',
}) {
  /*별 이미지 선택 함수*/
  const getStarImage = (rating) => {
    if (rating === 0) return '/img/star_empty.svg';
    if (rating >= 1 && rating <= 3) return '/img/star_half.svg';
    if (rating >= 4 && rating <= 5) return '/img/star_full.svg';
    return '/img/star_empty.svg';
  };

  return (
    <Gallery title={title} src={imgSrc} alt={alt}>
      {/* 별점과 점수 표시 */}
      <div className="flex items-center gap-1 mb-2">
        <Image
          src={getStarImage(rating)}
          alt="star rating"
          width={20}
          height={20}
        />
        <span className="font-bold text-lg">{rating}</span>
      </div>

      {/* 리뷰 내용 리스트*/}
      <div className="text-gray-600 text-sm leading-relaxed overflow-hidden whitespace-nowrap text-ellipsis">
        {content}
      </div>
    </Gallery>
  );
}
