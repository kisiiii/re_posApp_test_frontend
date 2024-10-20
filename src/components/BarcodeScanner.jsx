// components/BarcodeScanner.js
//useStateは状態を管理するために使う
//useEffectは、コンポーネントが表示されたときや、特定の状態が変わったときに一度だけ実行する処理を書く（カメラを起動してバーコードをスキャンする処理）
//useRefは、コンポーネント内の特定の要素（ここではvideoタグ）を操作するため(カメラ映像をvideoRef参照)
import { useState, useEffect, useRef } from 'react';
import Quagga from 'quagga'; // バーコード読み取りライブラリ

export default function BarcodeScanner({ onDetected }) {
  const videoRef = useRef(null);

  useEffect(() => {
    // カメラを起動する
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      // カメラ映像をvideoタグに表示
      videoRef.current.srcObject = stream;
      // 映像を再生、<video>タグを参照しており、srcObjectカメラ映像を設、
      videoRef.current.play();
    });

    // Quaggaでバーコードを検出する初期設定
    Quagga.init({
      //カメラからの映像を使ってバーコードを設定
      inputStream: {
        // ライブ映像を使う
        type: 'LiveStream',
        // 映像を表示するvideoタグ
        target: videoRef.current,
        // 映像のサイズ
        constraints: {
          width: 640,
          height: 480,
        },
      },
      decoder: {
        readers: ['ean_reader'], // EANコードを読み取る
      },
    }, (err) => {
      if (err) {
        console.error(err); // エラーがあれば表示
        return;
      }
      Quagga.start();　// 読み取り開始
    });

    Quagga.onDetected((data) => {
      const barcode = data.codeResult.code; // 検出されたバーコード
      onDetected(barcode); // 検出されたバーコードを親コンポーネントに渡す
    });

    //// Quaggaを停止
    return () => {
      Quagga.stop();
    };
  }, [onDetected]);

  return <video ref={videoRef} style={{ width: '100%' }} />;
}
