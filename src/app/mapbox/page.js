"use client"

import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import Image from 'next/image';
import UploadIcon from "@/../public/upload.png";
import CollectIcon from "@/../public/collect.png"

export default function Mapbox() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [shops, setShops] = useState([]);

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
    <div className="relative">
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

      {/* 右下角按鈕 */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-4">
        <button onClick={() => router.push('/collect')}>
          <Image src={CollectIcon} alt="Collect" width={50} height={50} />
        </button>
        <button onClick={() => router.push('/upload')}>
          <Image src={UploadIcon} alt="Upload" width={50} height={50} />
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
        {shops.map((shop) => (
          <Marker
            key={shop.id}
            longitude={shop.longitude}
            latitude={shop.latitude}
          >
            <div 
              className='w-10 h-10 bg-red-500 rounded-full'
              onClick={() => {
                alert(shop.name)
              }}
            ></div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}