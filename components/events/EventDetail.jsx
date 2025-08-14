import Image from "next/image";
import { IMAGES } from "@/constants/path";

export default function EventDetail({ eventData }) {

  return(
  <article className="w-[800px] flex flex-col mx-auto pt-6">
    <p>이벤트에 관한 설명글을 DB에서 받아옴.</p>
    <p>아래 title 받아오듯이 eventData에서 가져오던지, eventDetailData를 따로 불러옴</p>
    {eventData.title}
    <div className="">
      <Image
        src={eventData.imgSrc && eventData.imgSrc.trim() !== "" ? eventData.imgSrc : IMAGES.GALLERY_DEFAULT_IMG}
        width={800}
        height={600}
        alt={eventData.alt}
        className="w-full h-auto"
      />
    </div>
  </article>
  )
}