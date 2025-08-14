import { ICONS } from "@/constants/path";
import List from "../global/ListComponent";
import Image from "next/image";

function Stars({ score = 0 }) {
  const MAX = 5;

  // 0~5로 클램프 + 0.5단위로 반올림
  const rating = Math.round(Math.max(0, Math.min(MAX, Number(score))) * 2) / 2;
  const full = Math.floor(rating);           // 완전한 별 개수
  const hasHalf = rating - full === 0.5;     // rating된 값과, 내림한 값이 다르면 0.5점이 있음.

  return (
    <div className="flex items-center gap-1" aria-label={`평점 ${rating} / ${MAX}`}>
      {Array.from({ length: MAX }, (_, i) => { // 5번 수행
        const key = `star-${i}`;
        if (i < full) {
          return <Image key={key} src={ICONS.STAR_FULL} alt="별 1" width={20} height={20} />;
        }
        if (i === full && hasHalf) {
          return <Image key={key} src={ICONS.STAR_HALF} alt="별 0.5" width={20} height={20} />;
        }
        return <Image key={key} src={ICONS.STAR_EMPTY} alt="별 0" width={20} height={20} />;
      })}
      <span className="ml-1 text-sm text-gray-500">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function TestReviewList({
  imgSrc,
  alt = "",
  eventType = "이벤트유형",
  eventName = "이벤트명",
  score = 0,
  context = "이벤트 리뷰 본문"
}) {

  return (
    <div className="relative">
      <List src={imgSrc} alt={alt} enableInterest={false} >
        <div className="flex flex-col justify-around h-full">
          <div className="flex gap-2">
            <span className="border border-b-2 rounded-4xl px-2 w-fit">{eventType}</span>
            <strong className="text-black">{eventName}</strong>
          </div>
          <div className="h-12 overflow-hidden line-clamp-2 leading-6 whitespace-normal text-ellipsis">
            {context}
          </div>
          <Stars score={score} />
        </div>
      </List>
    </div>
  );
}
