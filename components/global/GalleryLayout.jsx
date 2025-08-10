import EventGallery from "../events/EventGallery";

export default function GalleryLayout({ Component, items, commonProps={} }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,300px)] gap-0 justify-center">
      {items.map((item, idx) => (
        <Component key={idx} {...item} {...commonProps} />
      ))}
    </div>
  )
}