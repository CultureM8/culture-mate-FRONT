import Gallery from "../global/Gallery";

export default function TogetherGallery({
  imgSrc, // 이미지 경로 (현재 빈 문자열)
  title = "모집글 제목", // 동행 모집 게시글 제목
  eventType = "이벤트유형", // 이벤트 유형 (태그)
  eventName = "이벤트명", // 구체적인 이벤트명
  group = "모집 인원", // 모집 현황 (현재인원/총인원)
  date = "0000.00.00", // 이벤트 날짜
  alt, // 이미지 대체텍스트 (접근성용)
}) {
  return (
    <Gallery title={title} src={imgSrc} alt={alt}>
      <div className="flex items-center gap-2">
        <div className="border border-b-2 rounded-4xl px-2">{eventType}</div>
        <div>{eventName}</div>
      </div>
      <div>
        {date} {group}
      </div>
    </Gallery>
  );
}
