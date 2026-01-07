'use client';

import { useState, useRef, useEffect } from 'react';

interface VideoState {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
}

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<VideoState>({
    isPlaying: false,
    volume: 0.5,
    currentTime: 0,
    duration: 0
  });
  const [showStartButton, setShowStartButton] = useState(true);

  // Воспроизведение/пауза
  const togglePlay = (): void => {
    if (videoRef.current) {
      if (state.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => {
          console.error('Ошибка воспроизведения видео:', error);
        });
      }
      setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  };

  // Клик по видео — пауза/воспроизведение
  const handleVideoClick = (): void => {
    togglePlay();
  };

  // Изменение громкости
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newVolume = parseFloat(e.target.value);
    setState(prev => ({ ...prev, volume: newVolume }));
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  // Перемотка видео
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setState(prev => ({ ...prev, currentTime: seekTime }));
    }
  };

  // Обновление текущего времени
  const updateTime = (): void => {
    if (videoRef.current) {
      setState(prev => ({ ...prev, currentTime: videoRef.current!.currentTime }));
    }
  };

  // Установка длительности видео
  const setVideoDuration = (): void => {
    if (videoRef.current && videoRef.current.duration) {
      setState(prev => ({ ...prev, duration: videoRef.current!.duration }));
    }
  };

  // Полноэкранный режим
  const toggleFullscreen = (): void => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(error => {
        console.error('Ошибка выхода из полноэкранного режима:', error);
      });
    } else if (videoRef.current) {
      videoRef.current.requestFullscreen().catch(error => {
        console.error('Ошибка перехода в полноэкранный режим:', error);
      });
    }
  };

  // Обработка нажатия Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && document.fullscreenElement) {
        document.exitFullscreen().catch(error => {
          console.error('Ошибка выхода из полноэкранного режима по Escape:', error);
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Кнопка старта поверх видео */}
      {showStartButton && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}>
          <button
            onClick={() => {
              videoRef.current?.play().catch(error =>
                console.error('Ошибка запуска:', error)
              );
              setShowStartButton(false);
            }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: '#000',
              border: 'none',
              padding: '20px 40px',
              fontSize: '24px',
              cursor: 'pointer',
              borderRadius: '50px'
            }}
          >
            ▶️ Начать просмотр
          </button>
        </div>
      )}

      <video
        ref={videoRef}
        onClick={handleVideoClick} // клик по видео запускает/ставит на паузу
        autoPlay={false}
        muted={false}
        loop={false}
        playsInline
        onTimeUpdate={updateTime}
        onLoadedMetadata={setVideoDuration}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#000000',
          cursor: 'pointer' // визуальная подсказка, что видео кликабельно
        }}
      >
        <source src="/happy_birthday_NV.mp4" type="video/mp4" />
        Ваш браузер не поддерживает видео.
      </video>

      {/* Панель управления */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        {/* Кнопка воспроизведения/паузы */}
        <button
          onClick={togglePlay}
          style={{
            backgroundColor: '#fff',
            border: 'none',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer'
          }}
        >
          {state.isPlaying ? '❚❚' : '▶'}
        </button>

        {/* Прогресс‑бар */}
        <input
          type="range"
          min="0"
          max={state.duration || 100}
          value={state.currentTime}
          onChange={handleSeek}
          style={{ flex: 1 }}
        />

        {/* Отображение времени */}
        <span style={{ color: '#fff', minWidth: '60px' }}>
          {formatTime(state.currentTime)} / {formatTime(state.duration)}
        </span>

        {/* Регулятор громкости */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: '#fff' }}>🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={state.volume}
            onChange={handleVolumeChange}
          />
        </div>

        {/* Кнопка полноэкранного режима */}
        <button
          onClick={toggleFullscreen}
          style={{
            backgroundColor: '#4a4a4a',
            color: '#fff',
            border: 'none',
            padding: '8px 12px',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          🗖️
        </button>
      </div>
    </div>
  );
}

// Вспомогательная функция для форматирования времени (мм:сс)
const formatTime = (seconds: number): string => {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
