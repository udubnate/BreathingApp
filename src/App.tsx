import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  opacity: number;
}

interface BreathingSettings {
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  pauseTime: number;
}

function App() {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [count, setCount] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [settings, setSettings] = useState<BreathingSettings>({
    inhaleTime: 4,
    holdTime: 4,
    exhaleTime: 4,
    pauseTime: 1
  });
  const [showSettings, setShowSettings] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // Enhanced particle animation effect
  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    const particleCount = 25;
    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 6 + 2,
      speed: Math.random() * 1.5 + 0.5,
      angle: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.5 + 0.3
    }));

    setParticles(newParticles);

    const animateParticles = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          x: (particle.x + Math.cos(particle.angle) * particle.speed + window.innerWidth) % window.innerWidth,
          y: (particle.y + Math.sin(particle.angle) * particle.speed + window.innerHeight) % window.innerHeight,
          opacity: particle.opacity + Math.sin(Date.now() / 1000) * 0.1,
          angle: particle.angle + Math.sin(Date.now() / 2000) * 0.02
        }))
      );
    };

    const animation = setInterval(animateParticles, 50);
    return () => clearInterval(animation);
  }, [isActive]);

  // Helper function to transition to next phase
  const transitionToNextPhase = useCallback(() => {
    if (phase === 'inhale') {
      setPhase('hold');
      setCount(settings.holdTime);
    } else if (phase === 'hold') {
      setPhase('exhale');
      setCount(settings.exhaleTime);
    } else if (phase === 'exhale') {
      setPhase('pause');
      setCount(settings.pauseTime);
    } else {
      setPhase('inhale');
      setCount(settings.inhaleTime);
    }
  }, [phase, settings]);

  // Breathing timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setCount((prevCount) => {
          if (prevCount <= 1) {
            transitionToNextPhase();
            return prevCount;
          }
          return prevCount - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, transitionToNextPhase]);

  // Stopwatch effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      if (!sessionStartTime) {
        setSessionStartTime(Date.now());
        setElapsedTime(0);
      }
      
      interval = setInterval(() => {
        if (sessionStartTime) {
          const currentTime = Date.now();
          const timeElapsed = Math.floor((currentTime - sessionStartTime) / 1000);
          setElapsedTime(timeElapsed);
        }
      }, 100);
    } else {
      setSessionStartTime(null);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, sessionStartTime]);

  const toggleBreathing = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setPhase('inhale');
      setCount(settings.inhaleTime);
      setSessionStartTime(Date.now());
      setElapsedTime(0);
    }
  };

  const handleSettingChange = (setting: keyof BreathingSettings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [setting]: Math.max(1, Math.min(10, value))
    }));
  };

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Helper function to get particle opacity based on phase
  const getParticleOpacity = (baseOpacity: number) => {
    switch (phase) {
      case 'inhale':
        return baseOpacity * 0.8;
      case 'hold':
        return baseOpacity;
      case 'exhale':
        return baseOpacity * 0.6;
      case 'pause':
        return baseOpacity * 0.4;
      default:
        return baseOpacity;
    }
  };

  return (
    <div className="App">
      {isActive && particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: getParticleOpacity(particle.opacity),
          }}
        />
      ))}
      
      <div className={`breathing-circle ${isActive ? 'active' : ''} ${phase}`}>
        <div className="count">{count}</div>
        <div className="phase">{phase}</div>
      </div>
      
      <div className="stopwatch">
        {isActive || elapsedTime > 0 ? formatTime(elapsedTime) : "--:--"}
      </div>
      
      <button className="start-button" onClick={toggleBreathing}>
        {isActive ? 'Stop Session' : 'Start Session'}
      </button>
      <button className="settings-button" onClick={() => setShowSettings(!showSettings)}>
        ⚙️
      </button>
      {showSettings && (
        <div className="settings-panel">
          <div className="setting-item">
            <label>Inhale Duration (s):</label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.inhaleTime}
              onChange={(e) => handleSettingChange('inhaleTime', parseInt(e.target.value))}
              disabled={isActive}
            />
          </div>
          <div className="setting-item">
            <label>Hold Duration (s):</label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.holdTime}
              onChange={(e) => handleSettingChange('holdTime', parseInt(e.target.value))}
              disabled={isActive}
            />
          </div>
          <div className="setting-item">
            <label>Exhale Duration (s):</label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.exhaleTime}
              onChange={(e) => handleSettingChange('exhaleTime', parseInt(e.target.value))}
              disabled={isActive}
            />
          </div>
          <div className="setting-item">
            <label>Pause Duration (s):</label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.pauseTime}
              onChange={(e) => handleSettingChange('pauseTime', parseInt(e.target.value))}
              disabled={isActive}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
