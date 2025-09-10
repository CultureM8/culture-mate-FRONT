export default function DefaultLayout({ children }) {
  return (
    <main className="mx-auto max-w-[1200px] px-[clamp(0px,6vw,0px)] relative">
      {children}
    </main>
  );
}