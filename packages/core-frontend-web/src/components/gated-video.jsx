import React, { useEffect, useState } from "react";
import useAuthStore from "core-frontend-web/src/stores/auth-store";
import { useReplaysStore } from "core-frontend-web/src/stores/replays-store";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

export default function GatedVideo({
  slug,
  thumbUrl,
  title,
  aspect = "aspect-video",
}) {
  const { canViewReplays, fetchAdminStatus, isLoading } = useAuthStore();
  const {
    getReplayBySlug,
    loading: replaysLoading,
    error: replaysError,
  } = useReplaysStore();
  const [embedUrl, setEmbedUrl] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [resolvedThumb, setResolvedThumb] = useState(thumbUrl || null);
  const [errorCode, setErrorCode] = useState(null); // 401|403|404|500|network
  const [attempted, setAttempted] = useState(false);
  const [replayNotFound, setReplayNotFound] = useState(false);

  useEffect(() => {
    if (!attempted) {
      setAttempted(true);
      fetchAdminStatus();
    }
  }, [attempted, fetchAdminStatus]);

  useEffect(() => {
    if (!slug) return;

    // Get replay data from store
    const replayData = getReplayBySlug(slug);

    if (!replayData) {
      // Replay not found in store
      setEmbedUrl(null);
      setPlatform(null);
      setVideoId(null);
      setErrorCode(null);

      // If store has finished loading and still no data, mark as not found
      if (!replaysLoading && !replaysError) {
        setReplayNotFound(true);
      } else {
        setReplayNotFound(false);
      }
      return;
    }

    // Reset not found flag when we find the replay
    setReplayNotFound(false);

    // Set thumbnail (from store or prop)
    if (!resolvedThumb && replayData.thumbUrl) {
      setResolvedThumb(replayData.thumbUrl);
    }

    // Set video data if user can view replays
    if (canViewReplays && replayData.canView) {
      setEmbedUrl(replayData.embedUrl || null);
      setPlatform(replayData.platform || null);
      setVideoId(replayData.id || null);
      setErrorCode(null);
    } else if (canViewReplays && !replayData.canView) {
      // User has replay access but this specific replay is not viewable
      setErrorCode(403);
      setEmbedUrl(null);
      setPlatform(null);
      setVideoId(null);
    } else {
      // User doesn't have replay access
      setEmbedUrl(null);
      setPlatform(null);
      setVideoId(null);
      setErrorCode(null);
    }
  }, [
    canViewReplays,
    slug,
    getReplayBySlug,
    resolvedThumb,
    replaysLoading,
    replaysError,
  ]);

  // Show loading state with same dimensions to prevent layout shift
  if (isLoading || replaysLoading) {
    return (
      <div className={`relative w-full ${aspect}`}>
        <div className="w-full h-full bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // If user has access and we have the embed URL, show the video
  if (canViewReplays && embedUrl) {
    if (platform === "youtube" && videoId) {
      return (
        <div className={`relative w-full ${aspect}`}>
          <LiteYouTubeEmbed id={videoId} title={title} />
        </div>
      );
    }
    return (
      <div className={`relative w-full ${aspect}`}>
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // If user has access but we're still loading the embed URL, show a loading state
  if (canViewReplays && !embedUrl && !errorCode) {
    return (
      <div className={`relative w-full ${aspect}`}>
        {resolvedThumb ? (
          <img
            src={resolvedThumb}
            alt={title}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center"></div>
        )}
        <div className="absolute inset-0 bg-black/50 rounded-md flex flex-col items-center justify-center text-center px-6">
          <div className="text-white text-sm">Loading video...</div>
        </div>
      </div>
    );
  }

  // Show the gated content (upgrade message or error)
  return (
    <div className={`relative w-full ${aspect}`}>
      {resolvedThumb ? (
        <img
          src={resolvedThumb}
          alt={title}
          className="w-full h-full object-cover rounded-md"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center"></div>
      )}
      <div className="absolute inset-0 bg-black/50 rounded-md flex flex-col items-center justify-center text-center px-6">
        {replayNotFound ? (
          <>
            <h3 className="text-white text-lg font-semibold mb-2">
              Replay not found
            </h3>
            <p className="text-white/90 text-sm max-w-md">
              This replay isn't available. Please check back later or contact
              support.
            </p>
          </>
        ) : errorCode && errorCode !== 403 ? (
          <>
            <h3 className="text-white text-lg font-semibold mb-2">
              Couldn’t load replay
            </h3>
            <p className="text-white/90 text-sm max-w-md">
              There was a problem loading this replay. Please refresh or try
              again later.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-white text-lg font-semibold mb-2">
              Join the Program to Watch
            </h3>
            <p className="text-white/90 text-sm mb-4 max-w-md">
              Get access to call replays and live training.
            </p>
            <a
              href="https://simpleamericanaccent.com/mg?utm_source=saa_web_app&utm_medium=web_app&utm_campaign=gated_video"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-100"
            >
              Upgrade Now
            </a>
          </>
        )}
      </div>
    </div>
  );
}
