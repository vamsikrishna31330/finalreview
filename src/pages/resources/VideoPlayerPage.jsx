import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTempStore } from '../../hooks/useTempStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useUI } from '../../hooks/useUI.js';
import PageHeader from '../../components/PageHeader.jsx';
import Button from '../../components/Button.jsx';
import './VideoPlayerPage.css';

const VideoPlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pushNotification } = useUI();
  const videoRef = useRef(null);
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Get resource data
  const { data: resources } = useTempStore(
    'resources',
    'SELECT resources.*, users.name AS author_name FROM resources LEFT JOIN users ON users.id = resources.created_by ORDER BY created_at DESC'
  );

  useEffect(() => {
    if (resources && resources.length > 0) {
      const foundResource = resources.find(r => r.id === parseInt(id));
      if (foundResource) {
        if (foundResource.file_type === 'video') {
          setResource(foundResource);
        } else {
          setError('This resource is not a video. Redirecting to resource detail...');
          setTimeout(() => navigate(`/resources/${id}`), 2000);
        }
      } else {
        setError('Video resource not found');
      }
      setLoading(false);
    }
  }, [resources, id, navigate]);

  // Video controls
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
      setPlaybackSpeed(newSpeed);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="video-player-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-player-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <Button onClick={() => navigate('/resources')}>Back to Resources</Button>
        </div>
      </div>
    );
  }

  const extractYouTubeId = (url) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const isYouTubeVideo = resource?.link && extractYouTubeId(resource?.link);

  return (
    <div className="video-player-page">
      <PageHeader
        title={resource?.title || 'Video Player'}
        subtitle={`Educational video by ${resource?.author_name || 'Unknown'}`}
        actions={
          <div className="video-actions">
            <Button onClick={() => navigate('/resources')} className="back-btn">
              ← Back to Resources
            </Button>
          </div>
        }
      />

      <div className="video-container">
        <div className="video-wrapper">
          {isYouTubeVideo ? (
            <div className="youtube-video-container">
              <iframe
                key={resource?.link}
                className="youtube-video"
                src={`https://www.youtube.com/embed/${extractYouTubeId(resource.link)}?rel=0&modestbranding=1&v=${resource.id}`}
                title={resource?.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : resource?.link ? (
            <video
              ref={videoRef}
              className="video-player"
              controls={false}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedMetadata={handleTimeUpdate}
            >
              <source src={resource.link} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : resource?.file_blob ? (
            <video
              ref={videoRef}
              className="video-player"
              controls={false}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedMetadata={handleTimeUpdate}
            >
              <source src={resource.file_blob} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="video-placeholder">
              <div className="placeholder-content">
                <div className="video-icon">🎥</div>
                <h3>{resource?.title}</h3>
                <p>{resource?.description}</p>
                <p className="file-info">File: {resource?.file_name}</p>
              </div>
            </div>
          )}
        </div>

        {!isYouTubeVideo && (resource?.link || resource?.file_blob) && (
          <div className="video-controls">
            <div className="controls-row">
              <button className="control-btn play-pause-btn" onClick={handlePlayPause}>
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              
              <div className="progress-container">
                <span className="time">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  className="progress-bar"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                />
                <span className="time">{formatTime(duration)}</span>
              </div>

              <div className="control-group">
                <div className="volume-control">
                  <span>🔊</span>
                  <input
                    type="range"
                    className="volume-slider"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                  />
                </div>

                <select
                  className="speed-control"
                  value={playbackSpeed}
                  onChange={handleSpeedChange}
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>

                <button className="control-btn fullscreen-btn" onClick={handleFullscreen}>
                  ⛶
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="video-info">
        <div className="info-card">
          <h3>About this Video</h3>
          <p><strong>Title:</strong> {resource?.title}</p>
          <p><strong>Category:</strong> {resource?.category}</p>
          <p><strong>Description:</strong> {resource?.description}</p>
          <p><strong>Author:</strong> {resource?.author_name}</p>
          <p><strong>Created:</strong> {new Date(resource?.created_at).toLocaleDateString()}</p>
          <p><strong>File:</strong> {resource?.file_name}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPage;
