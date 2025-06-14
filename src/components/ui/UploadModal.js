'use client';

import { useState } from 'react';
import { HASHTAG_THEMES, THEME_COLORS } from '../../lib/constants';
import { X, MapPin } from 'lucide-react';
import { Button } from './button';
// import { Input } from '../components/ui/input';
import { Input } from './input';
import { Label } from './label';
// import { Label } from './components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

export default function UploadModal({ isOpen, onClose, onUpload, userLocation }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedHashtag, setSelectedHashtag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !artist || !youtubeUrl || !selectedHashtag || !userLocation) return;

    setIsSubmitting(true);

    const hashtagTheme = HASHTAG_THEMES.find(ht => ht.hashtag === selectedHashtag);
    if (!hashtagTheme) return;

    const newCapsule = {
      title,
      artist,
      youtubeUrl,
      hashtag: selectedHashtag,
      theme: hashtagTheme.theme,
      longitude: userLocation[0],
      latitude: userLocation[1],
      createdAt: new Date(),
      createdBy: '當前使用者', // TODO: Get from auth
      isFavorite: false,
    };

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload
    onUpload(newCapsule);
    
    // Reset form
    setTitle('');
    setArtist('');
    setYoutubeUrl('');
    setSelectedHashtag('');
    setIsSubmitting(false);
  };

  const selectedTheme = HASHTAG_THEMES.find(ht => ht.hashtag === selectedHashtag);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4 rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              上傳音樂膠囊
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Song Title */}
          <div className="space-y-2">
            <Label htmlFor="title">歌曲名稱</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="輸入歌曲名稱"
              required
              className="rounded-xl"
            />
          </div>

          {/* Artist */}
          <div className="space-y-2">
            <Label htmlFor="artist">演唱者</Label>
            <Input
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="輸入演唱者"
              required
              className="rounded-xl"
            />
          </div>

          {/* YouTube URL */}
          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube 連結</Label>
            <Input
              id="youtube"
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              required
              className="rounded-xl"
            />
          </div>

          {/* Hashtag Theme Selection */}
          <div className="space-y-2">
            <Label htmlFor="hashtag">主題標籤</Label>
            <Select value={selectedHashtag} onValueChange={setSelectedHashtag} required>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="選擇主題標籤" />
              </SelectTrigger>
              <SelectContent>
                {HASHTAG_THEMES.map((theme) => (
                  <SelectItem key={theme.hashtag} value={theme.hashtag}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: THEME_COLORS[theme.theme] }}
                      />
                      {theme.hashtag}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Info */}
          {userLocation && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
              <MapPin className="w-4 h-4" />
              <span>將放置在您的當前位置</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !title || !artist || !youtubeUrl || !selectedHashtag}
            className="w-full rounded-xl h-12 font-medium"
            style={{
              backgroundColor: selectedTheme ? THEME_COLORS[selectedTheme.theme] : '#D9DADC',
            }}
          >
            {isSubmitting ? '上傳中...' : '創建膠囊'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}