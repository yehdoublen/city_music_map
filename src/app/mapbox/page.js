"use client"

import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import Image from 'next/image';
import SearchBar from '../../components/ui/SearchBar';

export default function Mapbox() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [shops, setShops] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Firestore 監聽 shops 集合
  useEffect(() => {
    const q = collection(db, "shops");
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const shopArr = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // 防呆：只顯示合法經緯度
        if (
          typeof data.latitude === 'number' &&
          typeof data.longitude === 'number' &&
          data.latitude >= -90 && data.latitude <= 90 &&
          data.longitude >= -180 && data.longitude <= 180
        ) {
          shopArr.push({ id: doc.id, ...data });
        }
      });
      setShops(shopArr);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="relative flex flex-col">
      {user && (
        <div className="absolute top-8 left-8 z-10">
          <div className="relative w-14 h-14">
            <Image
              src={user.photoURL}
              alt="Profile"
              fill
              className="rounded-full object-cover"
              sizes="(max-width: 40px) 100vw, 40px"
            />
          </div>
        </div>
      )}
      <div className="absolute top-8 left-200 z-10">
          <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="搜尋歌曲或 #主題標籤"
              />
        </div>
      {/* 右下角按鈕 */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-4">
        <button onClick={() => router.push('/collect')}>
          <Image src="/collect.png" alt="Collect" width={50} height={50} />
        </button>
        <button onClick={() => router.push('/upload')}>
          <Image src="/upload.png" alt="Upload" width={50} height={50} />
        </button>
      </div>

      <Map
        mapboxAccessToken="pk.eyJ1Ijoiamllbmh1YWdvbyIsImEiOiJjbTdsNjY0MjMwNDl2MmtzZHloYXY0czNkIn0.mlD3UGH3wR3ZMJmCuHDpSQ"
        initialViewState={{
          longitude: 121.52817156559162,
          latitude: 25.043949558152605,
          zoom: 17
        }}
        style={{width: "100vw", height: "100vh"}}
        mapStyle="mapbox://styles/mapbox/dark-v11"
      >
        {shops.map((shop) => {
          const colorMap = {
            yellow: "#FDC613",
            blue: "#1650FE",
            green: "#B1FF1B",
            purple: "#7A50EB",
            pink: "#FEA9E0"
          };
          const isCustomColor = colorMap[shop.color];
          return (
            <Marker
              key={shop.id}
              longitude={shop.longitude}
              latitude={shop.latitude}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center${!isCustomColor ? ` bg-${shop.color || 'red'}-500` : ''}`}
                style={isCustomColor ? { backgroundColor: colorMap[shop.color] } : {}}
                onClick={() => {
                  alert(shop.name)
                }}
                title={shop.name}
              ></div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}