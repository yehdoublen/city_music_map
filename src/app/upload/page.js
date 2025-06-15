"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../config/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function UploadPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
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
        createdAt: new Date(),
      });
      setSuccess(true);
      setName("");
      setLongitude("");
      setLatitude("");
      setTimeout(() => router.push("/mapbox"), 1000);
    } catch (err) {
      setError("儲存失敗：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">新增地點資訊</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="地點名稱"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            step="any"
            placeholder="經度 (longitude)"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            step="any"
            placeholder="緯度 (latitude)"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
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