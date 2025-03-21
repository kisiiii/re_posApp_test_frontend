// lib/api.js
export async function fetchProduct(barcode) {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error("API URLが設定されていません");
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
  
      if (!response.ok) {
        throw new Error("商品が見つかりませんでした");
      }
  
      return data;
    } catch (error) {
      console.error("商品情報の取得に失敗しました:", error);
      throw error;
    }
  }


export async function purchaseItems(cart) {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error("API URLが設定されていません");
    }
  
    const totalAmt = cart.reduce((total, item) => total + Number(item.price), 0);
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
  
      if (!response.ok) {
        throw new Error("購入処理に失敗しました");
      }
  
      return data;
    } catch (error) {
      console.error("購入処理中にエラーが発生しました:", error);
      throw error;
    }
  }


export async function createProduct(barcode, name, price) {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error("API URLが設定されていません");
    }
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ barcode, name, price }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error("商品情報の登録に失敗しました");
      }
  
      return data;
    } catch (error) {
      console.error("商品情報の登録に失敗しました:", error);
      throw error;
    }
  }