"use client";

export default function PageTitle({ children }) {
  return (
    <div className="w-full">
      <div className="w-full px-6">
        <h1 className="text-4xl font-bold py-[10px] h-16">
          {children}
        </h1>
      </div>
    </div>
  );
}