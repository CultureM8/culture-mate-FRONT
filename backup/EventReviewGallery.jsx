import Gallery from "../components/global/Gallery";
import StarScore from "@/lib/StarScore";

export default function EventReviewGallery({
  imgSrc,
  alt = "",
  // eventType = "이벤트유형",
  // eventName = "이벤트명",
  title = "이벤트 후기 제목",
  context = "이벤트 후기 내용",
  score = 0,
  // commentCount,
  // likeCount,
  // createdDate = "0000-00-00",
}) {
  return (
    <Gallery title={title} src={imgSrc} alt={alt}>
      {/* 이벤트유형, 이벤트명 */}
      {/* <div className="flex gap-2">
        <span className="border border-b-2 rounded-4xl px-2 w-fit">{eventType}</span>
        <strong>{eventName}</strong>
      </div> */}

      {/* 리뷰 내용 리스트*/}
      <div className="overflow-hidden whitespace-nowrap text-ellipsis">
        {context}
      </div>
      {/* 별점과 점수 표시 */}
      <StarScore score={score} />
    </Gallery>
  );
}
