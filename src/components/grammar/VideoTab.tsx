"use client";

import React, { useState } from "react";
import { Play, Video, ExternalLink } from "lucide-react";
import { IGrammarVideo } from "@/models/GrammarVideo";

interface VideoTabProps {
  videos: IGrammarVideo[];
  isLoading?: boolean;
}

// Utility function to extract video ID and get embed URL
const getVideoEmbedUrl = (
  url: string
): { embedUrl: string; platform: string } | null => {
  // YouTube
  const youtubeRegex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return {
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      platform: "youtube",
    };
  }

  // TikTok
  const tiktokRegex =
    /tiktok\.com\/@[\w.-]+\/video\/(\d+)|tiktok\.com\/v\/(\d+)|vm\.tiktok\.com\/([\w]+)/;
  const tiktokMatch = url.match(tiktokRegex);
  if (tiktokMatch) {
    const videoId = tiktokMatch[1] || tiktokMatch[2] || tiktokMatch[3];
    return {
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      platform: "tiktok",
    };
  }

  // Vimeo
  const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      platform: "vimeo",
    };
  }

  // Dailymotion
  const dailymotionRegex = /dailymotion\.com\/video\/([^_]+)/;
  const dailymotionMatch = url.match(dailymotionRegex);
  if (dailymotionMatch) {
    return {
      embedUrl: `https://www.dailymotion.com/embed/video/${dailymotionMatch[1]}`,
      platform: "dailymotion",
    };
  }

  return null;
};

const VideoTab: React.FC<VideoTabProps> = ({ videos, isLoading }) => {
  const [selectedVideo, setSelectedVideo] = useState<IGrammarVideo | null>(
    videos?.[0] || null
  );

  React.useEffect(() => {
    if (videos && videos.length > 0 && !selectedVideo) {
      setSelectedVideo(videos[0]);
    }
  }, [videos, selectedVideo]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="aspect-video bg-gray-200 rounded-2xl mb-6"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12">
        <Video size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Chưa có video bài giảng cho bài học này</p>
      </div>
    );
  }

  const videoEmbed = selectedVideo ? getVideoEmbedUrl(selectedVideo.url) : null;

  return (
    <div className="space-y-6">
      {/* Main Video Player */}
      <div className="bg-gray-900 rounded-2xl overflow-hidden">
        <div className="aspect-video relative">
          {videoEmbed ? (
            <iframe
              src={videoEmbed.embedUrl}
              className="w-full h-full"
              title={selectedVideo?.title || "Grammar Video"}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : selectedVideo ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gradient-to-br from-gray-800 to-gray-900">
              <Play size={60} className="mb-4 opacity-70" />
              <p className="text-lg mb-2">Không thể nhúng video</p>
              <a
                href={selectedVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
              >
                <ExternalLink size={18} />
                Mở video trong tab mới
              </a>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white">
              <Play size={60} className="mb-4 opacity-70" />
              <p>Chọn một video để xem</p>
            </div>
          )}
        </div>
      </div>

      {/* Video Info */}
      {selectedVideo && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="font-bold text-green-800 text-lg mb-1">
            {selectedVideo.title}
          </h3>
          <p className="text-green-600 text-sm">
            Ngày tạo:{" "}
            {new Date(selectedVideo.created_at).toLocaleDateString("vi-VN")}
          </p>
        </div>
      )}

      {/* Video List */}
      {videos.length > 1 && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">
            Danh sách video ({videos.length})
          </h4>
          <div className="space-y-2">
            {videos.map((video, index) => {
              const isSelected = selectedVideo?.id === video.id;
              return (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                    isSelected
                      ? "bg-green-50 border-green-400 shadow-sm"
                      : "bg-white border-gray-200 hover:border-green-300 hover:bg-green-50/50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isSelected ? (
                      <Play size={20} className="fill-current" />
                    ) : (
                      <span className="font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium truncate ${
                        isSelected ? "text-green-700" : "text-gray-700"
                      }`}
                    >
                      {video.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(video.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                      Đang phát
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTab;
