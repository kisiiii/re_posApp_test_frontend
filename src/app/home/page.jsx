"use client";

import { useState, useRef } from "react";
import { fetchProduct, purchaseItems, createProduct } from "../lib/api";
import { BrowserMultiFormatReader } from "@zxing/library";

export default function Home() {
  const [barcode, setBarcode] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [cart, setCart] = useState([]);
  const [newbarcode, setNewBarcode] = useState("");
  const [newproductName, setNewProductName] = useState("");
  const [newprice, setNewPrice] = useState("");
  const [newmessage, setNewMessage] = useState("");
  const videoRef = useRef(null);

/*
  const [stream, setStream] = useState(null);
  const codeReader = new BrowserMultiFormatReader();

  // カメラを起動してバーコードをスキャン
  const handleScanClick = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = videoStream;
      setStream(videoStream);

      codeReader.decodeOnceFromVideoDevice(null, videoRef.current)
        .then((result) => {
          if (result) {
            setBarcode(result.getText());
            handleStopScanClick();
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
  };
*/


  // バーコードから商品情報を取得
  const handleBarcodeInput = async () => {
    if (!barcode) {
      setMessage("バーコードを入力またはスキャンしてください");
      return;
    }

    try {
      const product = await fetchProduct(barcode);
      setProductName(product.name);
      setPrice(product.price);
      setMessage("");
    } catch (error) {
      setMessage(error.message || "商品情報の取得に失敗しました");
    }
  };

  // 商品情報を追加する
  const handleRegister = async () => {
    try {
      await createProduct(newbarcode, newproductName, parseFloat(newprice));
      setNewMessage("商品を登録しました");
      setNewBarcode("");
      setNewProductName("");
      setNewPrice("");
    } catch (error) {
      setNewMessage(error.message || "登録できませんでした");
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

  // 購入処理
  const handlePurchaseClick = async () => {
    try {
      const data = await purchaseItems(cart);
      alert(
        `合計金額（税抜）: ${data.totalAmt}円\n合計金額（税込）: ${data.totalAmtExTax}円\n購入が完了しました！`
      );
      setCart([]);
    } catch (error) {
      setMessage(error.message || "購入処理に失敗しました");
    }
  };

  // カート内アイテムの表示
  const renderCartItems = () => {
    return cart.map((item, index) => (
      <div key={index} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
        <p>{item.name} x1</p>
        <p>{item.price}円</p>
      </div>
    ));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>

      {/*
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button onClick={handleScanClick} style={buttonStyle}>スキャン（カメラ）</button>
        {stream && <button onClick={handleStopScanClick} style={buttonStyle}>カメラを停止</button>}
      </div>
      <div>
        <video ref={videoRef} autoPlay style={{ width: "100%", marginBottom: "20px" }} />
      </div>
      */}

      <h1 className="text-xl font-bold mb-4 pt-10">商品登録フォーム</h1>
      <input
        type="text"
        placeholder="バーコード"
        value={newbarcode}
        onChange={(e) => setNewBarcode(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <input
        type="text"
        placeholder="商品名"
        value={newproductName}
        onChange={(e) => setNewProductName(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <input
        type="number"
        placeholder="価格"
        value={newprice}
        onChange={(e) => setNewPrice(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <button
        onClick={handleRegister}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
      >
        商品を登録
      </button>
      {newmessage && <p className="mt-4 text-center">{newmessage}</p>}


      <h1 className="text-xl font-bold mb-4 pt-10">商品情報取得</h1>
      <input
        type="text"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        placeholder="バーコードを入力ください"
        style={inputStyle}
      />
      <button onClick={handleBarcodeInput} style={buttonStyle}>商品を取得</button>
      {productName && (
        <div>
          <p>名称: {productName}</p>
          <p>単価: {price}円</p>
        </div>
      )}
      {message && <p>{message}</p>}
      <button onClick={handleAddToCart} style={buttonStyle}>買い物かごに追加</button>

      <h1 className="text-xl font-bold mb-4 pt-10">買い物かご</h1>
      <div style={listStyle}>{renderCartItems()}</div>
      <button onClick={handlePurchaseClick} style={buttonStyle}>購入</button>
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
