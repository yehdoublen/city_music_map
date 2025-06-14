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

import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRouter } from 'next/navigation';

export default function MapView() {
  const router = useRouter();

  const shoplist = [
    {
      name: "興波咖啡",
      longitude: 121.52766963927368,
      latitude: 25.043965449092184
    },
    {
      name: "Louisa cafe",
      longitude: 121.5256896960265,
      latitude: 25.044273301214552
    },
    {
      name: "木白甜點咖啡店",
      longitude: 121.52509694997262,
      latitude: 25.045587635063846
    }
  ];

  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1Ijoiamllbmh1YWdvbyIsImEiOiJjbTdsNjY0MjMwNDl2MmtzZHloYXY0czNkIn0.mlD3UGH3wR3ZMJmCuHDpSQ"}
      initialViewState={{
        longitude: 121.52817156559162,
        latitude: 25.043949558152605,
        zoom: 17
      }}
      style={{ width: "100vw", height: "100vh" }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
    >
      {shoplist.map((shop, idx) => (
        <Marker
          key={idx}
          longitude={shop.longitude}
          latitude={shop.latitude}
        >
          <div
            className="w-4 h-4 bg-red-500 rounded-full shadow-md cursor-pointer"
            title={shop.name}
            onClick={() => router.push(`/room`)}
          />
        </Marker>
      ))}
    </Map>
  );
}
