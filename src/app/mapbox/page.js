"use client"

import Map, { Marker, useMap } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRouter } from 'next/navigation';


export default function Mapbox() {
  const router = useRouter();

    const  shoplist = [
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
    ]

  return (
    <>
      <Map
        mapboxAccessToken="pk.eyJ1Ijoiamllbmh1YWdvbyIsImEiOiJjbTdsNjY0MjMwNDl2MmtzZHloYXY0czNkIn0.mlD3UGH3wR3ZMJmCuHDpSQ"
        initialViewState={{
          longitude: 121.52817156559162,
          latitude: 25.043949558152605,
          zoom: 17
        }}
        //加入 marker
        style={{width: "100vw", height: "100vh"}}
        mapStyle="mapbox://styles/mapbox/dark-v11"
      >

        {shoplist.map((shop) => (
            <Marker
                longitude={shop.longitude}
                latitude={shop.latitude}
            >
                <div className='w-10 h-10 bg-red-500 rounded-full'
                onClick={() => {
                    router.push(`/room`);
                }}
            ></div>
        </Marker>
      ))}
      </Map>
    </>
  );

}