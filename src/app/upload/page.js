"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../config/firebase";
import { collection, addDoc } from "firebase/firestore";


const colorMap = {
  yellow: "#FDC613",
  blue: "#1650FE",
  green: "#B1FF1B",
  purple: "#7A50EB",
  pink: "#FEA9E0"
};

export default function UploadPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [youtube, setYoutube] = useState("");
  const [color, setColor] = useState("red");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await addDoc(collection(db, "shops"), {
        name,
        longitude: parseFloat(longitude),
        latitude: parseFloat(latitude),
        youtube,
        color,
        createdAt: new Date(),
      });
      setSuccess(true);
      setName("");
      setLongitude("");
      setLatitude("");
      setYoutube("");
      setColor("red");
      setTimeout(() => router.push("/mapbox"), 1000);
    } catch (err) {
      setError("儲存失敗：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen rounded-lg flex flex-col items-center justify-center bg-gray-100">
      <div className="items-center flex flex-col bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {/* <h1 className="text-2xl font-bold mb-6 text-center">新增地點資訊</h1> */}
        <img src="/Frame.svg" alt="新增音樂" className="w-[80px] h-[80px]" />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Youtube 連結"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border rounded-full px-3 py-3"
          />
          <input
            type="number"
            step="any"
            placeholder="經度 (longitude)"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
            className="border rounded-full px-3 py-3"
          />
          <input
            type="number"
            step="any"
            placeholder="緯度 (latitude)"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
            className="border rounded-full px-3 py-3"
          />
          <input
            type="url"
            placeholder="位置名稱"
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            className="border rounded-full px-3 py-3"
          />
          <div className="items-center flex gap-6 mt-5 justify-center">
              {[
                { value: "blue", color: "#3B82F6" },
                { value: "green", color: "#B1FF1B" },
                { value: "yellow", color: "#FDC613" },
                { value: "purple", color: "#7A50EB" },
                { value: "pink", color: "#FEA9E0" },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={`w-8 h-12 rounded-full border-2 transition-transform duration-150 flex items-center justify-center ${color === opt.value ? 'scale-125' : 'border-gray-300'}`}
                  style={{ backgroundColor: opt.color }}
                  aria-label={opt.value}
                />
              ))}
            </div>
         
          <button
            type="submit"
            disabled={loading}
            className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-4 rounded-full border-2 border-black transition-colors duration-200"
          >
            {loading ? "儲存中..." : "送出"}
          </button>
        </form>
        {error && <div className="text-red-500 mt-4">{error}</div>}
        {success && <div className="text-green-500 mt-4">儲存成功！</div>}
      </div>
    </main>
  );
}