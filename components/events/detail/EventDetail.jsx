import Image from "next/image";
import { IMAGES } from "@/constants/path";

export default function EventDetail({ eventData }) {
  return (
    <article className="w-[800px] flex flex-col mx-auto pt-6">
      {/* <p>이벤트에 관한 설명글을 DB에서 받아옴.</p> */}
      {/* <p>
        아래 title 받아오듯이 eventData에서 가져오던지, eventDetailData를 따로
        불러옴
      </p> */}
      {eventData.title}

      {/* 백엔드에서 받아온 content 표시 */}
      {eventData.content && (
        <div className="mt-4 mb-4">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {eventData.content}
          </div>
        </div>
      )}

      <div className="">
        <Image
          src={
            eventData.imgSrc && eventData.imgSrc.trim() !== ""
              ? eventData.imgSrc
              : IMAGES.GALLERY_DEFAULT_IMG
          }
          width={800}
          height={600}
          alt={eventData.alt}
          className="w-full h-auto"
        />
      </div>

      {/* 백엔드에서 받아온 contentImageUrls가 있으면 표시 */}
      {eventData.contentImageUrls && eventData.contentImageUrls.length > 0 && (
        <div className="mt-4">
          {eventData.contentImageUrls.map((imageUrl, index) => (
            <div key={index} className="mb-4">
              <Image
                src={imageUrl}
                width={800}
                height={600}
                alt={`${eventData.title} 상세 이미지 ${index + 1}`}
                className="w-full h-auto"
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
