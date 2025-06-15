"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const colorMap = {
  yellow: "#FDC613",
  blue: "#1650FE",
  green: "#B1FF1B",
  purple: "#7A50EB",
  pink: "#FEA9E0"
};

// 從 YouTube URL 取得影片 ID
const getYoutubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingVideoInfo, setLoadingVideoInfo] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    youtube: "",
    song: "",
    artist: "",
    longitude: "",
    latitude: "",
    color: "red"
  });

  // 從 YouTube URL 取得影片資訊
  const fetchVideoInfo = async (url) => {
    if (!url) return;
    const videoId = getYoutubeId(url);
    if (!videoId) return;

    setLoadingVideoInfo(true);
    try {
      const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      const data = await response.json();
      
      if (data.title) {
        // 解析標題和作者
        const titleParts = data.title.split('-');
        const artist = titleParts[0]?.trim() || data.author_name || '';
        const song = titleParts[1]?.trim() || data.title;

        // 更新表單數據
        setFormData(prev => ({
          ...prev,
          song,
          artist,
          youtube: url
        }));
      }
    } catch (error) {
      console.error('Error fetching video info:', error);
    } finally {
      setLoadingVideoInfo(false);
    }
  };

  // 當 YouTube URL 改變時自動獲取影片資訊
  useEffect(() => {
    if (formData.youtube) {
      fetchVideoInfo(formData.youtube);
    }
  }, [formData.youtube]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const shopData = {
        ...formData,
        longitude: parseFloat(formData.longitude),
        latitude: parseFloat(formData.latitude),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "shops"), shopData);
      router.push("/mapbox");
    } catch (error) {
      console.error("Error adding shop:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <main className="min-h-screen rounded-lg flex flex-col items-center justify-center bg-gray-100">
      <div className="items-center flex flex-col bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {/* <h1 className="text-2xl font-bold mb-6 text-center">新增地點資訊</h1> */}
        <img src="/Frame.svg" alt="新增音樂" className="w-[80px] h-[80px]" />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <input
            type="text"
            name="name"
            placeholder="位置名稱"
            value={formData.name}
            onChange={handleChange}
            required
            className="border rounded-full px-3 py-3"
          />
          <div className="relative">
            <input
              type="url"
              name="youtube"
              placeholder="YouTube 連結"
              value={formData.youtube}
              onChange={handleChange}
              required
              className="border rounded-full px-3 py-3 w-full"
            />
            {loadingVideoInfo && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                獲取中...
              </div>
            )}
          </div>
          <input
            type="number"
            name="longitude"
            step="any"
            placeholder="經度 (longitude)"
            value={formData.longitude}
            onChange={handleChange}
            required
            className="border rounded-full px-3 py-3"
          />
          <input
            type="number"
            name="latitude"
            step="any"
            placeholder="緯度 (latitude)"
            value={formData.latitude}
            onChange={handleChange}
            required
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
                onClick={() => setFormData(prev => ({ ...prev, color: opt.value }))}
                className={`w-8 h-12 rounded-full border-2 transition-transform duration-150 flex items-center justify-center ${formData.color === opt.value ? 'scale-125' : 'border-gray-300'}`}
                style={{ backgroundColor: opt.color }}
                aria-label={opt.value}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={loading || loadingVideoInfo}
            className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-4 rounded-full border-2 border-black transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "儲存中..." : "送出"}
          </button>
        </form>
      </div>
    </main>
  );
}