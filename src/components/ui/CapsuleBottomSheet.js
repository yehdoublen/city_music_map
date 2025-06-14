import { useState } from 'react';
import { THEME_COLORS } from '../../lib/constants';
import { X, Play, Heart, Share2 } from 'lucide-react';
import { Button } from './button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './sheet';
import YouTube from 'react-youtube';

export default function CapsuleBottomSheet({ capsule, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!capsule) return null;

  const color = THEME_COLORS[capsule.theme];
  const videoId = capsule.youtubeUrl.split('v=')[1]?.split('&')[0];

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Update in Firebase
  };

  const opts = {
    height: '200',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
    },
  };

  return (
    <Sheet open={!!capsule} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl border-0 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <div className="w-6 h-6 bg-white rounded-full" />
                </div>
                <div>
                  <SheetTitle className="text-lg font-semibold text-left">
                    {capsule.title}
                  </SheetTitle>
                  <p className="text-sm text-gray-600">{capsule.artist}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
            {/* Hashtag */}
            <div 
              className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium"
              style={{ backgroundColor: color }}
            >
              {capsule.hashtag}
            </div>

            {/* YouTube Player */}
            {videoId && (
              <div className="bg-black rounded-2xl overflow-hidden">
                <YouTube
                  videoId={videoId}
                  opts={opts}
                  className="w-full"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                className="flex-1 rounded-full h-12 font-medium"
                style={{ backgroundColor: color }}
              >
                <Play className="w-5 h-5 mr-2" />
                播放
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleToggleFavorite}
                className={`rounded-full h-12 w-12 ${
                  isFavorite ? 'bg-red-50 border-red-200' : ''
                }`}
              >
                <Heart 
                  className={`w-5 h-5 ${
                    isFavorite ? 'fill-red-500 text-red-500' : ''
                  }`} 
                />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Metadata */}
            <div className="pt-4 space-y-2 text-sm text-gray-600">
              <p>創建者：{capsule.createdBy}</p>
              <p>創建時間：{capsule.createdAt.toLocaleDateString('zh-TW')}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 