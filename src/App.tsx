import React, { useState, useEffect } from 'react';
import './App.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
}

interface BreathingSettings {
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
}

function App() {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [count, setCount] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [settings, setSettings] = useState<BreathingSettings>({
    inhaleTime: 4,
    holdTime: 4,
    exhaleTime: 4
  });
  const [showSettings, setShowSettings] = useState(false);

  // Particle animation effect
  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    const particleCount = 20;
    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 1 + 0.5,
      angle: Math.random() * Math.PI * 2
    }));

    setParticles(newParticles);

    const animateParticles = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          x: (particle.x + Math.cos(particle.angle) * particle.speed + window.innerWidth) % window.innerWidth,
          y: (particle.y + Math.sin(particle.angle) * particle.speed + window.innerHeight) % window.innerHeight
        }))
      );
    };

    const animation = setInterval(animateParticles, 50);
    return () => clearInterval(animation);
  }, [isActive]);

  // Breathing timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setCount((prevCount) => {
          if (prevCount === 1) {
            if (phase === 'inhale') {
              setPhase('hold');
              return settings.holdTime;
            } else if (phase === 'hold') {
              setPhase('exhale');
              return settings.exhaleTime;
            } else {
              setPhase('inhale');
              return settings.inhaleTime;
            }
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
  }, [isActive, phase, settings]);

  const toggleBreathing = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setPhase('inhale');
      setCount(settings.inhaleTime);
    }
  };

  const handleSettingChange = (setting: keyof BreathingSettings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [setting]: Math.max(1, Math.min(10, value)) // Limit between 1-10 seconds
    }));
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
            opacity: phase === 'inhale' ? 0.6 : phase === 'hold' ? 0.8 : 0.4,
          }}
        />
      ))}
      <div className={`breathing-circle ${phase} ${isActive ? 'active' : ''}`}>
        <div className="count">{count}</div>
        <div className="phase">{phase}</div>
      </div>
      <button className="start-button" onClick={toggleBreathing}>
        {isActive ? 'Stop Session' : 'Start Session'}
      </button>
      <button className="settings-button" onClick={() => setShowSettings(!showSettings)}>
        ⚙️ Settings
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
        </div>
      )}
    </div>
  );
}

export default App;
