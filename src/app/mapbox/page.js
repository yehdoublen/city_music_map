"use client"

import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../config/firebase';
import { collection, onSnapshot, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import Image from 'next/image';
import SearchBar from '../../components/ui/SearchBar';

export default function Mapbox() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [shops, setShops] = useState([]);
  const [userLocations, setUserLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [youtube, setYoutube] = useState("");
  const [loadingNowPlaying, setLoadingNowPlaying] = useState(false);
  const songInputRef = useRef();
  const [activeUserInfo, setActiveUserInfo] = useState(null);
  const [nowPlayingMap, setNowPlayingMap] = useState({});

  

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 監聽所有已上傳地點
  useEffect(() => {
    const q = collection(db, "shops");
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const shopArr = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
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

  // 監聽所有登入者即時位置
  useEffect(() => {
    const q = collection(db, "users_location");
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const locations = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          typeof data.latitude === 'number' &&
          typeof data.longitude === 'number' &&
          data.latitude >= -90 && data.latitude <= 90 &&
          data.longitude >= -180 && data.longitude <= 180
        ) {
          locations.push({ id: doc.id, ...data });
        }
      });
      setUserLocations(locations);
    });
    return () => unsubscribe();
  }, []);

  // 監聽所有使用者的 now playing
  useEffect(() => {
    const q = collection(db, "user_nowplaying");
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const map = {};
      querySnapshot.forEach((doc) => {
        map[doc.id] = doc.data();
      });
      setNowPlayingMap(map);
    });
    return () => unsubscribe();
  }, []);

  // 取得目前使用者歌曲資訊
  const fetchNowPlaying = async () => {
    if (!user) return;
    setLoadingNowPlaying(true);
    const docRef = doc(db, "user_nowplaying", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setNowPlaying(data);
      setSong(data.song || "");
      setArtist(data.artist || "");
      setYoutube(data.youtube || "");
    } else {
      setNowPlaying(null);
      setSong("");
      setArtist("");
      setYoutube("");
    }
    setLoadingNowPlaying(false);
  };

  // 點擊頭像時顯示 modal 並載入歌曲資訊
  const handleAvatarClick = () => {
    setShowModal(true);
    setEditMode(false);
    fetchNowPlaying();
  };

  // 儲存歌曲資訊
  const handleSave = async () => {
    if (!user) return;
    await setDoc(doc(db, "user_nowplaying", user.uid), {
      song,
      artist,
      youtube,
      updatedAt: new Date(),
    });
    setEditMode(false);
    fetchNowPlaying();
  };

  // 取得 YouTube 影片 ID
  const getYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:v=|youtu.be\/)([\w-]{11})/);
    return match ? match[1] : null;
  };

  // 彩色膠囊色票
  const colorMap = {
    yellow: "#FDC613",
    blue: "#1650FE",
    green: "#B1FF1B",
    purple: "#7A50EB",
    pink: "#FEA9E0"
  };

  useEffect(() => {
    if (!user) return;

    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          await setDoc(doc(db, 'users_location', user.uid), {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            latitude,
            longitude,
            updatedAt: new Date(),
          });
        },
        (err) => {
          // 可以加錯誤處理
        },
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [user]);

  return (
    <div className="relative w-full h-screen min-w-[370px]">
      {/* 左上角登入者頭像 */}
      {user && (
        <div className="absolute top-4 left-4 z-10">
          <div className="relative w-12 h-12 cursor-pointer" onClick={handleAvatarClick}>
            <Image
              src={user.photoURL}
              alt="Profile"
              fill
              className="rounded-full object-cover border-2 border-white shadow"
              sizes="48px"
            />
          </div>
        </div>
      )}

      {/* 右上角搜尋欄 */}
      <div className="absolute top-4 right-4 z-10 w-72 max-w-xs h-12 flex items-center">
        <SearchBar className="h-full" />
      </div>

      {/* 右下角上傳和收藏按鈕 */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-4">
        <button onClick={() => router.push('/collect')}>
          <Image src="/collect.png" alt="Collect" width={50} height={50} />
        </button>
        <button onClick={() => router.push('/upload')}>
          <Image src="/upload.png" alt="Upload" width={50} height={50} />
        </button>
      </div>

      {/* 歌曲資訊 Modal */}
      {showModal && (
        <div className="absolute z-50 top-20 left-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative border">
            {/* 標題與關閉按鈕 */}
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-2xl">正在聽的歌曲</span>
              <button
                className="text-2xl text-gray-400 hover:text-gray-600"
                onClick={() => setShowModal(false)}
                title="關閉"
              >
                &times;
              </button>
            </div>
            {loadingNowPlaying ? (
              <div className="text-center">載入中...</div>
            ) : editMode ? (
              <div className="flex flex-col gap-3">
                <input
                  ref={songInputRef}
                  type="text"
                  placeholder="歌曲名稱"
                  value={song}
                  onChange={e => setSong(e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="歌手名稱"
                  value={artist}
                  onChange={e => setArtist(e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="url"
                  placeholder="YouTube 連結"
                  value={youtube}
                  onChange={e => setYoutube(e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  onClick={handleSave}
                >
                  儲存
                </button>
                <button
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-full"
                  onClick={async () => {
                    if (user) {
                      await deleteDoc(doc(db, 'users_location', user.uid));
                    }
                    await auth.signOut();
                    router.push('/');
                  }}
                >
                  登出
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {nowPlaying?.youtube && getYoutubeId(nowPlaying.youtube) && (
                  <div className="mt-2">
                    <iframe
                      width="100%"
                      height="180"
                      src={`https://www.youtube.com/embed/${getYoutubeId(nowPlaying.youtube)}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
                {/* 加號按鈕移到這裡 */}
                <div className="flex justify-center px-16">
                  <button
                    className="mt-2 text-xl text-blue-500 hover:text-blue-700 w-full border border-blue-200 rounded-full p-2"
                    onClick={() => setEditMode(true)}
                    title="編輯"
                  >
                    edit
                  </button>
                </div>
                  
                <button
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-full"
                  onClick={async () => {
                    if (user) {
                      await deleteDoc(doc(db, 'users_location', user.uid));
                    }
                    await auth.signOut();
                    router.push('/');
                  }}
                >
                  登出
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Map
        mapboxAccessToken="pk.eyJ1Ijoiamllbmh1YWdvbyIsImEiOiJjbTdsNjY0MjMwNDl2MmtzZHloYXY0czNkIn0.mlD3UGH3wR3ZMJmCuHDpSQ"
        initialViewState={{
          longitude: 121.52817156559162,
          latitude: 25.043949558152605,
          zoom: 17
        }}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
      >
        {/* 顯示所有登入者即時位置（白色圓點） */}
        {userLocations.map((loc) => (
          <Marker
            key={loc.id}
            longitude={loc.longitude}
            latitude={loc.latitude}
          >
            <div className="relative flex flex-col items-center">
              {/* 歌曲資訊浮層（只讀） */}
              {activeUserInfo === loc.uid && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-6 bg-white rounded-lg shadow-lg px-4 py-2 border w-64 z-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold">正在聽的歌曲</span>
                    <button className="text-gray-400 hover:text-gray-600" onClick={() => setActiveUserInfo(null)}>&times;</button>
                  </div>
                  <div>&#60;{nowPlayingMap[loc.uid]?.song || <span className="text-gray-400 font-bold text-2xl">未填寫</span>}&#62;</div>
                  <div>{nowPlayingMap[loc.uid]?.artist || <span className="text-gray-400">未填寫</span>}</div>
                  {nowPlayingMap[loc.uid]?.youtube && getYoutubeId(nowPlayingMap[loc.uid]?.youtube) && (
                    <div className="mt-2">
                      <iframe
                        width="100%"
                        height="120"
                        src={`https://www.youtube.com/embed/${getYoutubeId(nowPlayingMap[loc.uid]?.youtube)}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </div>
              )}
              <div
                className="w-6 h-6 rounded-full bg-white cursor-pointer"
                style={{ boxShadow: "0 0 16px 8px #fff, 0 0 4px 2px #ffffff" }}
                title={loc.displayName || loc.uid}
                onClick={() => setActiveUserInfo(activeUserInfo === loc.uid ? null : loc.uid)}
              ></div>
            </div>
          </Marker>
        ))}
        {/* 顯示所有已上傳地點（彩色膠囊） */}
        {shops.map((shop) => {
          const isCustomColor = colorMap[shop.color];
          return (
            <Marker
              key={shop.id}
              longitude={shop.longitude}
              latitude={shop.latitude}
            >
              <div
                className={`w-6 h-6 rounded-full shadow-lg flex items-center justify-center${!isCustomColor ? ` bg-${shop.color || 'red'}-500` : ''}`}
                style={isCustomColor ? { backgroundColor: colorMap[shop.color] } : {}}
                title={shop.name}
                onClick={() => alert(shop.name)}
              ></div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}