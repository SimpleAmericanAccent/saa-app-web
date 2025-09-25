import React, { useEffect, useState } from "react";
import useAuthStore from "core-frontend-web/src/stores/authStore";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

export default function GatedVideo({
  slug,
  thumbUrl,
  title,
  aspect = "aspect-video",
}) {
  const { canViewReplays, fetchAdminStatus, isLoading } = useAuthStore();
  const [embedUrl, setEmbedUrl] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [resolvedThumb, setResolvedThumb] = useState(thumbUrl || null);
  const [errorCode, setErrorCode] = useState(null); // 401|403|404|500|network
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!attempted) {
      setAttempted(true);
      fetchAdminStatus();
    }
  }, [attempted, fetchAdminStatus]);

  useEffect(() => {
    // Always fetch non-sensitive metadata to display a thumbnail, even if user can't view
    if (slug && !resolvedThumb) {
      fetch(`/api/replays/${slug}/meta`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.thumbUrl && !resolvedThumb) setResolvedThumb(data.thumbUrl);
        })
        .catch(() => {});
    }

    if (canViewReplays && slug) {
      fetch(`/api/replays/${slug}/url`)
        .then(async (r) => {
          if (!r.ok) {
            // HTTP error: set specific code and clear embed info
            setErrorCode(r.status);
            setEmbedUrl(null);
            setPlatform(null);
            setVideoId(null);
            return null;
          }
          const data = await r.json();
          return data;
        })
        .then((data) => {
          if (!data) return;
          const { embedUrl, platform, id, thumbUrl } = data;
          setEmbedUrl(embedUrl);
          setPlatform(platform);
          setVideoId(id);
          if (!resolvedThumb && thumbUrl) setResolvedThumb(thumbUrl);
          setErrorCode(null);
        })
        .catch(() => {
          // Network or parsing error: only set to network if we don't already have a specific code
          setEmbedUrl(null);
          setPlatform(null);
          setVideoId(null);
          setErrorCode((prev) => (prev == null ? "network" : prev));
        });
    }
  }, [canViewReplays, slug]);

  // Show loading state with same dimensions to prevent layout shift
  if (isLoading) {
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
        {errorCode === 404 ? (
          <>
            <h3 className="text-white text-lg font-semibold mb-2">
              Replay not found
            </h3>
            <p className="text-white/90 text-sm max-w-md">
              This replay isn’t available. Please check back later or contact
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
              href="/join"
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
