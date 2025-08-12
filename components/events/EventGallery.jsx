import Image from "next/image"
import Gallery from "../global/Gallery"
import { ICONS } from "@/constants/path"

export default function EventGallery(
  { imgSrc, alt, title = "제목", date = "0000.00.00 ~ 0000.00.00", location = "지역 및 장소명", href = "", isHot = false }
) {
  return (
    <Gallery title={title} src={imgSrc} alt={alt} href={href}>
      <>
        {date}
      </>
      <div className="flex items-center gap-1">
        {isHot && (
          <div className="flex items-center gap-1">
          인기
          <Image 
            src={ICONS.FIRE} 
            alt="인기"
            width={24}
            height={24}
          />
        </div>
        )}
        {location}
      </div>
    </Gallery>
  )
}