"use client";

import { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

export default function Home() {
  const [barcode, setBarcode] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [cart, setCart] = useState([]);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false); // スキャン中の状態管理

  const codeReader = new BrowserMultiFormatReader();

  // カメラを起動してバーコードをスキャン
  const handleScanClick = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = videoStream;
      setStream(videoStream);
      setScanning(true); // スキャン開始

      // 一度だけバーコードを読み取る
      codeReader
        .decodeOnceFromVideoDevice(null, videoRef.current)
        .then((result) => {
          if (result) {
            setBarcode(result.getText()); // バーコードをセット
            handleStopScanClick(); // カメラを停止
          }
        })
        .catch((err) => {
          console.error("バーコードの読み取りに失敗しました:", err);
        });
    } catch (err) {
      console.error("カメラの起動に失敗しました:", err);
      setMessage("カメラの起動に失敗しました");
    }
  };

  // カメラのストリームを停止
  const handleStopScanClick = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      videoRef.current.srcObject = null;
    }
    setScanning(false); // スキャン停止
  };

  // 手動入力またはスキャンで取得したバーコードを使用して商品情報を取得
  const handleBarcodeInput = async () => {
    if (!barcode) {
      setMessage("バーコードを入力またはスキャンしてください");
      return;
    }

    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.error("API URLが設定されていません");
      setMessage("API URLが設定されていません");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/product/${barcode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setProductName(data.name);
        setPrice(data.price);
        setMessage("");
      } else {
        setMessage("商品が見つかりませんでした");
      }
    } catch (error) {
      console.error("商品情報の取得に失敗しました:", error);
      setMessage("商品情報の取得に失敗しました");
    }
  };

  // カートに商品を追加
  const handleAddToCart = () => {
    if (!productName || !price) return;

    const newProduct = {
      name: productName,
      price: price,
      barcode: barcode,
    };

    setCart([...cart, newProduct]);

    setBarcode("");
    setProductName("");
    setPrice("");
  };

  // 合計金額計算
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + Number(item.price), 0);
  };

  // 購入処理
  const handlePurchaseClick = async () => {
    const totalAmt = calculateTotal();
    const totalAmtExTax = Math.round(totalAmt * 1.1);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cart,
            totalAmt,
            totalAmtExTax,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(
          `合計金額（税抜）: ${data.totalAmt}円\n合計金額（税込）: ${data.totalAmtExTax}円\n購入が完了しました！`
        );
        setCart([]);
      } else {
        setMessage("購入処理に失敗しました");
      }
    } catch (error) {
      console.error("購入処理中にエラーが発生しました:", error);
      setMessage("購入処理中にエラーが発生しました");
    }
  };

  // 購入リストの表示
  const renderCartItems = () => {
    return cart.map((item, index) => (
      <div
        key={index}
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "5px",
        }}
      >
        <p>{item.name} x1</p>
        <p>{item.price}円</p>
      </div>
    ));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button onClick={handleScanClick} style={buttonStyle}>
          スキャン（カメラ）
        </button>
        {stream && (
          <button onClick={handleStopScanClick} style={buttonStyle}>
            カメラを停止
          </button>
        )}
      </div>

      <div>
        <video
          ref={videoRef}
          autoPlay
          style={{ width: "100%", marginBottom: "20px" }}
        />
      </div>

      <input
        type="text"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        placeholder="バーコードを手入力もできます"
        style={inputStyle}
      />

      <button onClick={handleBarcodeInput} style={buttonStyle}>
        商品を取得
      </button>

      {productName && (
        <div>
          <p>名称: {productName}</p>
          <p>単価: {price}円</p>
        </div>
      )}

      {message && <p>{message}</p>}

      <button onClick={handleAddToCart} style={buttonStyle}>
        追加
      </button>

      <h3>購入リスト</h3>
      <div style={listStyle}>{renderCartItems()}</div>

      <button onClick={handlePurchaseClick} style={buttonStyle}>
        購入
      </button>
    </div>
  );
}

const buttonStyle = {
  backgroundColor: "#ADD8E6",
  padding: "10px 20px",
  margin: "10px 0",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
  width: "100%",
};

const inputStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  margin: "10px 0",
  width: "100%",
  display: "block",
};

const listStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  margin: "10px 0",
  width: "100%",
};
