// 'use client';

// import { useRef, useCallback } from 'react';
// import CapsuleMarker from '../CapsuleMarker';
// import UserMarker from '../UserMarker';
// // import Map, { Marker, NavigationControl } from 'react-map-gl';
// import { Map, Marker, NavigationControl } from 'react-map-gl/mapbox';
// import { MAPBOX_STYLE, DEFAULT_ZOOM, DEFAULT_LOCATION } from '../../lib/constants';


// export default function MapView({
//   viewMode,
//   capsules,
//   users,
//   userLocation,
//   onCapsuleClick,
// }) {
//   const mapRef = useRef();

//   const handleCapsuleClick = useCallback((capsule) => {
//     onCapsuleClick(capsule);
//   }, [onCapsuleClick]);

//   const centerLocation = userLocation || DEFAULT_LOCATION;

//   return (
//     <div className="w-full h-full">
//       <Map
//         ref={mapRef}
//         mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGVtby11c2VyIiwiYSI6ImNsczR2aWgwajFvNjAyanBnYTdsd3FmZGoifQ.demo-token'}
//         initialViewState={{
//           longitude: centerLocation[0],
//           latitude: centerLocation[1],
//           zoom: DEFAULT_ZOOM,
//         }}
//         style={{ width: '100%', height: '100%' }}
//         mapStyle={MAPBOX_STYLE}
//         attributionControl={false}
//       >
//         {/* Navigation Control */}
//         <NavigationControl position="bottom-right" showCompass={false} />

//         {/* Music Capsules */}
//         {viewMode === 'capsules' && capsules.map((capsule) => (
//           <Marker
//             key={capsule.id}
//             longitude={capsule.longitude}
//             latitude={capsule.latitude}
//             anchor="bottom"
//           >
//             <CapsuleMarker
//               capsule={capsule}
//               onClick={() => handleCapsuleClick(capsule)}
//             />
//           </Marker>
//         ))}

//         {/* Nearby Users */}
//         {viewMode === 'nearby' && users.map((user) => (
//           <Marker
//             key={user.id}
//             longitude={user.longitude}
//             latitude={user.latitude}
//             anchor="bottom"
//           >
//             <UserMarker user={user} />
//           </Marker>
//         ))}

//         {/* User's Current Location */}
//         {userLocation && (
//           <Marker
//             longitude={userLocation[0]}
//             latitude={userLocation[1]}
//             anchor="center"
//           >
//             <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
//           </Marker>
//         )}
//       </Map>
//     </div>
//   );
// }





"use client";

import { useState, useCallback, useRef } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouter } from "next/navigation";

// Mock Data: 模擬資料，可替換為 props 傳入
const mockCapsules = [
  {
    id: "capsule1",
    name: "興波咖啡",
    longitude: 121.52767,
    latitude: 25.04396,
    topic: "#chill"
  },
  {
    id: "capsule2",
    name: "Louisa cafe",
    longitude: 121.52569,
    latitude: 25.04427,
    topic: "#work"
  },
  {
    id: "capsule3",
    name: "木白甜點",
    longitude: 121.52509,
    latitude: 25.04558,
    topic: "#sweet"
  }
];

const mockUsers = [
  {
    id: "user1",
    name: "Alex",
    longitude: 121.5265,
    latitude: 25.0441
  },
  {
    id: "user2",
    name: "Emma",
    longitude: 121.527,
    latitude: 25.0437
  }
];

// 地圖初始常數
const MAPBOX_STYLE = "mapbox://styles/mapbox/light-v11";
const DEFAULT_ZOOM = 17;
const DEFAULT_LOCATION = [121.5281, 25.044];
const userLocation = [121.5281, 25.044]; // 模擬使用者定位


export default function MapView() {
  const router = useRouter();
  const mapRef = useRef(null);

  const [viewMode, setViewMode] = useState("capsules");

  const handleCapsuleClick = useCallback((capsule) => {
    console.log("Capsule clicked:", capsule.name);
    router.push(`/room/${capsule.id}`); // 可改為顯示 modal、bottom sheet 等
  }, [router]);

  return (
    <div className="w-full h-full relative">
      {/* 切換模式按鈕 */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md px-3 py-1 space-x-2">
        <button
          className={`text-sm ${viewMode === "capsules" ? "font-bold text-blue-600" : ""}`}
          onClick={() => setViewMode("capsules")}
        >
          Capsules
        </button>
        <button
          className={`text-sm ${viewMode === "nearby" ? "font-bold text-orange-600" : ""}`}
          onClick={() => setViewMode("nearby")}
        >
          Nearby
        </button>
      </div>

      <Map
        ref={mapRef}
        // mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1Ijoiamllbmh1YWdvbyIsImEiOiJjbTdsNjY0MjMwNDl2MmtzZHloYXY0czNkIn0.mlD3UGH3wR3ZMJmCuHDpSQ"}
        initialViewState={{
          longitude: DEFAULT_LOCATION[0],
          latitude: DEFAULT_LOCATION[1],
          zoom: DEFAULT_ZOOM
        }}
        mapStyle={MAPBOX_STYLE}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        {/* 地圖控制器 */}
        <NavigationControl position="bottom-right" showCompass={false} />

        {/* 膠囊顯示 */}
        {viewMode === "capsules" &&
          mockCapsules.map((capsule) => (
            <Marker
              key={capsule.id}
              longitude={capsule.longitude}
              latitude={capsule.latitude}
              anchor="bottom"
            >
              <div
                className="w-4 h-4 bg-pink-500 rounded-full shadow-md cursor-pointer"
                title={capsule.name}
                onClick={() => handleCapsuleClick(capsule)}
              />
            </Marker>
          ))}

        {/* 使用者圖標顯示 */}
        {viewMode === "nearby" &&
          mockUsers.map((user) => (
            <Marker
              key={user.id}
              longitude={user.longitude}
              latitude={user.latitude}
              anchor="bottom"
            >
              <div
                className="w-4 h-4 bg-gray-600 rounded-full shadow-md cursor-pointer"
                title={user.name}
              />
            </Marker>
          ))}

        {/* 使用者定位點 */}
        {userLocation && (
          <Marker
            longitude={userLocation[0]}
            latitude={userLocation[1]}
            anchor="center"
          >
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
          </Marker>
        )}
      </Map>
    </div>
  );
}





// "use client";

// import Map, { Marker } from 'react-map-gl/mapbox';
// import 'mapbox-gl/dist/mapbox-gl.css';
// import { useRouter } from 'next/navigation';

// export default function MapView() {
//   const router = useRouter();

//   const shoplist = [
//     {
//       name: "興波咖啡",
//       longitude: 121.52766963927368,
//       latitude: 25.043965449092184
//     },
//     {
//       name: "Louisa cafe",
//       longitude: 121.5256896960265,
//       latitude: 25.044273301214552
//     },
//     {
//       name: "木白甜點咖啡店",
//       longitude: 121.52509694997262,
//       latitude: 25.045587635063846
//     }
//   ];

//   return (
//     <Map
//       mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1Ijoiamllbmh1YWdvbyIsImEiOiJjbTdsNjY0MjMwNDl2MmtzZHloYXY0czNkIn0.mlD3UGH3wR3ZMJmCuHDpSQ"}
//       initialViewState={{
//         longitude: 121.52817156559162,
//         latitude: 25.043949558152605,
//         zoom: 17
//       }}
//       style={{ width: "100vw", height: "100vh" }}
//       mapStyle="mapbox://styles/mapbox/dark-v11"
//     >
//       {shoplist.map((shop, idx) => (
//         <Marker
//           key={idx}
//           longitude={shop.longitude}
//           latitude={shop.latitude}
//         >
//           <div
//             className="w-4 h-4 bg-red-500 rounded-full shadow-md cursor-pointer"
//             title={shop.name}
//             onClick={() => router.push(`/room`)}
//           />
//         </Marker>
//       ))}
//     </Map>
//   );
// }
