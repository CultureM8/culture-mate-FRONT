import StarScore from "@/lib/StarScore";
import ListComponent from "../global/ListComponent";

export default function EventReviewList({
  imgSrc,
  alt = "",
  eventType = "이벤트유형",
  eventName = "이벤트명",
  title = "이벤트 후기 제목",
  context = "이벤트 후기 내용",
  score = 0,
  commentCount = 0,
  likeCount = 0,
  createdDate = "0000-00-00",
}) {

  return (
    <ListComponent src={imgSrc} alt={alt} enableInterest={false} >
      <div className="flex justify-between">
        <div className="flex flex-col justify-around h-full flex-1 min-w-0">
          <div className="flex gap-2">
            <span className="border border-b-2 rounded-4xl px-2 w-fit">{eventType}</span>
            <strong>{eventName}</strong>
          </div>
          <h3 className="text-lg font-bold overflow-hidden whitespace-nowrap text-ellipsis text-black">
            {title}
          </h3>
          <div className="overflow-hidden whitespace-nowrap text-ellipsis">
            {context}
          </div>
          <StarScore score={score} />
        </div>
        <div className="flex items-center gap-6 mb-1 flex-shrink-0">
          <span className="min-w-[140px] text-center">
            {commentCount}
          </span>
          <span className="min-w-[140px] text-center">
            {likeCount}
          </span>
          <span className="min-w-[180px] text-center">
            {createdDate}
          </span>
        </div>
      </div>
    </ListComponent>
  );
}
