export default function TestListLayout({ Component, items, commonProps={} }) {
  return (
    <div className="flex flex-col gap-0 w-full">
      {items.map((item, idx) => (
        <Component key={idx} {...item} {...commonProps} />
      ))}
    </div>
  )
}