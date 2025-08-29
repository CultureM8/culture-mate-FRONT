import React, { useState, useEffect } from "react";

const SlidingBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [images, setImages] = useState([]);
  const [allImages, setAllImages] = useState([]);

  /* 이미지 파일 로드*/
  useEffect(() => {
    const loadImages = async () => {
      try {
        const response = await fetch("/api/images");
        const data = await response.json();

        if (data.images && data.images.length > 0) {
          /*전체 이미지 목록 저장*/
          setAllImages(data.images);

          /* 이미지를 랜덤으로 5개 선택*/
          const shuffledImages = data.images
            .sort(() => Math.random() - 0.5)
            .slice(0, 5)
            .map((image, index) => ({
              id: index + 1,
              src: image.path,
              alt: `Event Image ${index + 1}`,
              filename: image.filename,
            }));

          setImages(shuffledImages);
        } else {
          console.log("No images found");
          setImages([]);
          setAllImages([]);
        }
      } catch (error) {
        console.error("Failed to load images:", error);
        setImages([]);
        setAllImages([]);
      }
    };

    loadImages();
  }, []);

  /* 이미지 로드 실패 시 다른 이미지로 교체*/
  const handleImageError = (failedIndex) => {
    if (allImages.length <= images.length) return; // 교체할 이미지가 없으면 리턴

    /* 현재 사용 중이지 않은 이미지 찾기*/
    const usedSrcs = images.map((img) => img.src);
    const availableImages = allImages.filter(
      (img) => !usedSrcs.includes(img.path)
    );

    if (availableImages.length > 0) {
      /* 랜덤하게 새 이미지 선택*/
      const randomImage =
        availableImages[Math.floor(Math.random() * availableImages.length)];

      /* 실패한 이미지를 새 이미지로 교체*/
      setImages((prev) =>
        prev.map((img, index) =>
          index === failedIndex
            ? {
                ...img,
                src: randomImage.path,
                filename: randomImage.filename,
                alt: `Event Image ${index + 1} (Replaced)`,
              }
            : img
        )
      );
    }
  };

  /* 자동 슬라이드 기능*/
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000); /* 5초마다 자동 슬라이드*/

    return () => clearInterval(interval);
  }, [images.length]);

  /* 이전 슬라이드로 이동*/
  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  /* 다음 슬라이드로 이동*/
  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  /* 특정 슬라이드로 이동*/
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  /*이미지가 로드되지 않았으면 로딩 표시*/
  if (images.length === 0) {
    return (
      <div className="w-full h-[370px] bg-gray-200 rounded-xl flex items-center justify-center">
        <div className="text-gray-500">이미지를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-8">
      <div className="relative w-full h-[370px] overflow-hidden shadow-lg">
        {/* 슬라이드 컨테이너 */}
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {images.map((image, index) => (
            <div
              key={image.id}
              className="min-w-full h-full relative flex-shrink-0">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover block"
                loading={index === 0 ? "eager" : "lazy"}
                onError={() => handleImageError(index)}
                onLoad={() =>
                  console.log(`Image ${index + 1} loaded successfully`)
                }
              />
              {/* 가장자리 페이드 효과 */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                       linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.3) 100%),
                       linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.2) 100%)
                     `,
                }}></div>
            </div>
          ))}
        </div>

        {/* 이전/다음 버튼 */}
        <button
          onClick={goToPrevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2  hover:bg-opacity-50 text-white w-10 h-10 rounded-full transition-all duration-300 backdrop-blur-sm flex items-center justify-center z-10"
          aria-label="이전 이미지">
          <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[8px] border-t-transparent border-b-transparent border-r-white ml-[-2px]"></div>
        </button>

        <button
          onClick={goToNextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2  hover:bg-opacity-50 text-white w-10 h-10 rounded-full transition-all duration-300 backdrop-blur-sm flex items-center justify-center z-10"
          aria-label="다음 이미지">
          <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[8px] border-t-transparent border-b-transparent border-l-white mr-[-2px]"></div>
        </button>

        {/* 인디케이터 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white bg-opacity-60 hover:bg-opacity-80"
              }`}
              aria-label={`${index + 1}번째 이미지로 이동`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlidingBanner;
