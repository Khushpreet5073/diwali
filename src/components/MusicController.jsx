import { useState, useEffect } from 'react';
import { audioManager } from '../audio/AudioManager';

/**
 * Floating sound controller.
 *
 * Props:
 *   initialEnabled – boolean, set from EntryScreen choice so the
 *                    controller's visual state matches from the start.
 *   onToggle       – optional callback(enabled) called after each toggle.
 */
export default function MusicController({ initialEnabled = false, onToggle }) {
  const [enabled, setEnabled] = useState(initialEnabled);

  // Sync initial state into the manager on mount (App already called
  // setEnabled before rendering us, but this keeps the visual in sync
  // if the prop arrives after mount).
  useEffect(() => {
    setEnabled(initialEnabled);
  }, [initialEnabled]);

  // Subscribe to external changes (e.g. the manager being toggled
  // from elsewhere like GrandFinale) so the icon stays accurate.
  useEffect(() => {
    const unsub = audioManager.subscribe(val => setEnabled(val));
    return unsub;
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    audioManager.setEnabled(next);
    onToggle?.(next);
  };

  return (
    <div
      id="music-controller"
      className="music-controller"
      onClick={toggle}
      title={enabled ? 'Mute sounds' : 'Enable sounds'}
      role="button"
      aria-pressed={enabled}
      aria-label={enabled ? 'Sound On' : 'Sound Off'}
    >
      <div className="music-icon">
        <div className="music-bars">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`music-bar${!enabled ? ' muted' : ''}`}
              style={{ animationDelay: `${(i - 1) * 0.15}s` }}
            />
          ))}
        </div>
      </div>
      <span className="music-label">{enabled ? 'Sound On' : 'Sound Off'}</span>
    </div>
  );
}
