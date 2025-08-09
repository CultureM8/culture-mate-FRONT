import EventGallery from "../events/EventGallery";

export default function GalleryLayout({ Component, items }) {
  return (
    <div className="grid grid-cols-1 gap-0 justify-center">
      {items.map((item, idx) => (
        <Component key={idx} {...item} />
      ))}
    </div>
  );
}
