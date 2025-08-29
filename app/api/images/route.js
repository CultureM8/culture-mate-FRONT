/*배너이미지*/
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const imagesDirectory = path.join(
      process.cwd(),
      "public",
      "event-main-img"
    );

    /* 디렉토리가 존재하는지 확인*/
    if (!fs.existsSync(imagesDirectory)) {
      return NextResponse.json(
        { error: "Images directory not found" },
        { status: 404 }
      );
    }

    /* 모든 파일 읽기*/
    const files = fs.readdirSync(imagesDirectory);

    /* 이미지 파일만 필터링 (jpeg, jpg, png, webp, gif)*/
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return [".jpeg", ".jpg", ".png", ".webp", ".gif"].includes(ext);
    });

    /*파일명을 경로와 함께 반환*/
    const imageList = imageFiles.map((file) => ({
      filename: file,
      path: `/event-main-img/${file}`,
    }));

    return NextResponse.json({ images: imageList });
  } catch (error) {
    console.error("Error reading images directory:", error);
    return NextResponse.json(
      { error: "Failed to read images" },
      { status: 500 }
    );
  }
}
