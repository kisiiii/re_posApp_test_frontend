"use client";

import { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

export default function BarcodeScanner() {
  const [barcode, setBarcode] = useState("");
  const videoRef = useRef(null);
  const codeReader = new BrowserMultiFormatReader();

  useEffect(() => {
    const startScanner = async () => {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // 環境カメラを使用
        });
        videoRef.current.srcObject = videoStream;

        // 一度だけバーコードをスキャンする方法
        codeReader
          .decodeOnceFromVideoDevice(null, videoRef.current)
          .then((result) => {
            if (result) {
              setBarcode(result.getText());
            }
          })
          .catch((err) => {
            console.error("バーコード読み取り中のエラー:", err);
          });
      } catch (error) {
        console.error("カメラの起動に失敗しました:", error);
      }
    };

    startScanner();

    return () => {
      codeReader.reset(); // コンポーネントのアンマウント時にスキャナーをリセット
    };
  }, []);

  return (
    <div>
      <h1>バーコードスキャナー</h1>
      <video ref={videoRef} style={{ width: "100%" }} autoPlay muted />
      {barcode && <p>検出されたバーコード: {barcode}</p>}
    </div>
  );
}
