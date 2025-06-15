"use client"

import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../config/firebase';
import { collection, onSnapshot, doc, getDoc, setDoc, deleteDoc, addDoc, query, where } from 'firebase/firestore';
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
  const [loadingVideoInfo, setLoadingVideoInfo] = useState(false);
  const songInputRef = useRef();
  const [activeUserInfo, setActiveUserInfo] = useState(null);
  const [nowPlayingMap, setNowPlayingMap] = useState({});
  const [activeShopInfo, setActiveShopInfo] = useState(null);
  const [searchSong, setSearchSong] = useState("");
  const [userFavorites, setUserFavorites] = useState([]);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  

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

  // 監聽使用者收藏
  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'user_favorites', user.uid, 'items');
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const favs = [];
      querySnapshot.forEach((doc) => {
        favs.push({ id: doc.id, ...doc.data() });
      });
      setUserFavorites(favs);
    });
    return () => unsubscribe();
  }, [user]);

  // 收藏/取消收藏
  const toggleFavorite = async (favType, favId, favData) => {
    if (!user) return;
    const favRef = collection(db, 'user_favorites', user.uid, 'items');
    // 判斷是否已收藏
    const exists = userFavorites.some(fav => fav.type === favType && fav.refId === favId);
    if (exists) {
      // 取消收藏
      const toDelete = userFavorites.find(fav => fav.type === favType && fav.refId === favId);
      if (toDelete) await deleteDoc(doc(favRef, toDelete.id));
    } else {
      // 新增收藏
      await addDoc(favRef, { type: favType, refId: favId, ...favData, createdAt: new Date() });
    }
  };

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

  // 從 YouTube URL 取得影片資訊並自動儲存
  const fetchAndSaveVideoInfo = async (url) => {
    if (!url || !user) return;
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

        // 直接儲存到 Firebase
        await setDoc(doc(db, "user_nowplaying", user.uid), {
          song,
          artist,
          youtube: url,
          updatedAt: new Date(),
        });

        // 更新本地狀態
        setNowPlaying({ song, artist, youtube: url });
        setYoutube(url);
        setSong(song);
        setArtist(artist);
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error fetching video info:', error);
    } finally {
      setLoadingVideoInfo(false);
    }
  };

  // 當 YouTube URL 改變時自動獲取影片資訊
  useEffect(() => {
    if (youtube) {
      fetchAndSaveVideoInfo(youtube);
    }
  }, [youtube]);

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
        <input
          type="text"
          placeholder="搜尋歌曲名稱..."
          value={searchSong}
          onChange={e => setSearchSong(e.target.value)}
          className="h-full w-full rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black placeholder-gray-400"
        />
        {searchSong && (
          <button
            className="absolute right-2 text-gray-400 hover:text-gray-600 text-xl"
            onClick={() => setSearchSong("")}
            title="清除搜尋"
          >
            ×
          </button>
        )}
      </div>

      {/* 右下角上傳和收藏按鈕 */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-4">
        <button onClick={() => setShowFavoritesModal(true)}>
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
                <div className="relative">
                  <input
                    ref={songInputRef}
                    type="url"
                    placeholder="貼上 YouTube 連結"
                    value={youtube}
                    onChange={e => setYoutube(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                    disabled={loadingVideoInfo}
                  />
                  {loadingVideoInfo && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      獲取中...
                    </div>
                  )}
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
                {nowPlaying && (
                  <div className="text-center">
                    <div className="text-lg font-bold">{nowPlaying.song}</div>
                    <div className="text-gray-600">{nowPlaying.artist}</div>
                  </div>
                )}
                <div className="flex justify-center px-16">
                  <button
                    className="mt-2 text-xl text-blue-500 hover:text-blue-700 w-full border border-blue-200 rounded-full p-2"
                    onClick={() => setEditMode(true)}
                    title="編輯"
                  >
                    edit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 收藏彈窗 */}
      {showFavoritesModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowFavoritesModal(false)} />
          <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center">
            <button
              className="absolute top-2 right-14 text-3xl text-white hover:text-gray-300 z-20"
              onClick={() => setShowFavoritesModal(false)}
              title="關閉"
            >
              &times;
            </button>
            <div className="flex flex-col gap-4 w-full mt-12 mb-8 px-14">
              {userFavorites.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">尚未收藏任何歌曲或地點</div>
              ) : (
                userFavorites.map((fav) => (
                  <div key={fav.id} className="bg-white rounded-lg shadow-lg p-4 border w-full flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-2">
                      <span className="font-bold text-lg truncate max-w-[70%]">{fav.type === 'shop' ? fav.name : fav.displayName || '使用者'}</span>
                      <span className="text-xs text-gray-400">{fav.type === 'shop' ? '地點' : '使用者'}</span>
                    </div>
                    {fav.song && <div className="w-full text-base font-bold truncate">{fav.song}</div>}
                    {fav.artist && <div className="w-full text-gray-600 truncate">{fav.artist}</div>}
                    {fav.youtube && fav.youtube.length > 0 && (
                      <div className="w-full mt-2">
                        <iframe
                          width="100%"
                          height="180"
                          src={`https://www.youtube.com/embed/${getYoutubeId(fav.youtube)}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <Map
        mapboxAccessToken="pk.eyJ1IjoieWVodWFubiIsImEiOiJjbWJ2cXJ2d2cwcnB6MnFwcXljdXV3bTJkIn0.1Qz6Pnf3W57F4cA8d-NRjQ"
        initialViewState={{
          longitude: 121.52817156559162,
          latitude: 25.043949558152605,
          zoom: 17
        }}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/yehuann/cmbxckh4800lb01spfcye8l7s"
        onClick={() => {
          setActiveUserInfo(null);
          setActiveShopInfo(null);
        }}
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
                    {/* 收藏愛心按鈕 */}
                    <button
                      className={
                        'ml-2 text-2xl ' +
                        (userFavorites.some(fav => fav.type === 'user' && fav.refId === loc.uid)
                          ? 'text-red-500'
                          : 'text-gray-300 hover:text-red-400')
                      }
                      title={userFavorites.some(fav => fav.type === 'user' && fav.refId === loc.uid) ? '取消收藏' : '收藏'}
                      onClick={() => toggleFavorite('user', loc.uid, {
                        song: nowPlayingMap[loc.uid]?.song || '',
                        artist: nowPlayingMap[loc.uid]?.artist || '',
                        youtube: nowPlayingMap[loc.uid]?.youtube || '',
                        displayName: loc.displayName || '',
                        photoURL: loc.photoURL || '',
                      })}
                    >
                      ♥
                    </button>
                  </div>
                  {nowPlayingMap[loc.uid] ? (
                    <>
                      <div className="text-lg font-bold">{nowPlayingMap[loc.uid].song}</div>
                      <div className="text-gray-600">{nowPlayingMap[loc.uid].artist}</div>
                      {nowPlayingMap[loc.uid].youtube && getYoutubeId(nowPlayingMap[loc.uid].youtube) && (
                        <div className="mt-2">
                          <iframe
                            width="100%"
                            height="120"
                            src={`https://www.youtube.com/embed/${getYoutubeId(nowPlayingMap[loc.uid].youtube)}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-400 text-center py-2">未設定歌曲</div>
                  )}
                </div>
              )}
              <div
                className="w-6 h-6 rounded-full bg-white cursor-pointer"
                style={{ boxShadow: "0 0 16px 8px #fff, 0 0 4px 2px #ffffff" }}
                title={loc.displayName || loc.uid}
                onClick={e => { e.stopPropagation(); setActiveUserInfo(loc.uid); }}
              ></div>
            </div>
          </Marker>
        ))}
        {/* 顯示所有已上傳地點（彩色膠囊） */}
        {shops.map((shop) => {
          const isCustomColor = colorMap[shop.color];
          // 搜尋過濾：有搜尋字串時，只有歌曲名稱包含該字串的高亮
          let highlight = true;
          if (searchSong.trim()) {
            highlight = (shop.song || "").toLowerCase().includes(searchSong.trim().toLowerCase());
          }
          return (
            <Marker
              key={shop.id}
                longitude={shop.longitude}
                latitude={shop.latitude}
            >
              <div className="relative flex flex-col items-center">
                {/* 地點資訊浮層 */}
                {activeShopInfo === shop.id && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-6 bg-white rounded-lg shadow-lg px-4 py-2 border w-64 z-50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">{shop.name}</span>
                      {/* 收藏愛心按鈕 */}
                      <button
                        className={
                          'ml-2 text-2xl ' +
                          (userFavorites.some(fav => fav.type === 'shop' && fav.refId === shop.id)
                            ? 'text-red-500'
                            : 'text-gray-300 hover:text-red-400')
                        }
                        title={userFavorites.some(fav => fav.type === 'shop' && fav.refId === shop.id) ? '取消收藏' : '收藏'}
                        onClick={() => toggleFavorite('shop', shop.id, {
                          name: shop.name,
                          song: shop.song || '',
                          artist: shop.artist || '',
                          youtube: shop.youtube || '',
                          color: shop.color || '',
                          latitude: shop.latitude,
                          longitude: shop.longitude,
                        })}
                      >
                        ♥
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{shop.address}</div>
                    {shop.song && (
                      <>
                        <div className="text-lg font-bold">{shop.song}</div>
                        <div className="text-gray-600">{shop.artist}</div>
                      </>
                    )}
                    {shop.youtube && getYoutubeId(shop.youtube) && (
                      <div className="mt-2">
                        <iframe
                          width="100%"
                          height="120"
                          src={`https://www.youtube.com/embed/${getYoutubeId(shop.youtube)}`}
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
                  className={`w-6 h-6 rounded-full shadow-lg flex items-center justify-center${!isCustomColor ? ` bg-${shop.color || 'red'}-500` : ''}`}
                  style={{
                    ...(isCustomColor ? { backgroundColor: colorMap[shop.color] } : {}),
                    opacity: highlight ? 1 : 0.1,
                    transition: 'opacity 0.3s',
                  }}
                  title={shop.name}
                  onClick={e => { e.stopPropagation(); setActiveShopInfo(shop.id); }}
                ></div>
              </div>
        </Marker>
          );
        })}
      </Map>
    </div>
  );
}