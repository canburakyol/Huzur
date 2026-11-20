import { ChevronRight, Mic, Pause, Play } from 'lucide-react';

function ReciterBrowser({
  activeItem,
  activeReciter,
  getSurahAudioUrl,
  onPlaySurah,
  onSelectReciter,
  playingIndex,
  reciters = [],
  surahs = []
}) {
  if (!activeItem) {
    return null;
  }

  if (activeReciter) {
    return (
      <div className="reveal-stagger">
        <div className="settings-group">
          <div className="settings-group-title premium-text">{activeReciter.name} - Hatim Seti</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {surahs.map((surah, index) => {
              const audioUrl = getSurahAudioUrl?.(surah.number, activeReciter.id);
              const isPlaying = playingIndex === index;

              return (
                <div
                  key={surah.number}
                  className="settings-card reveal-stagger premium-glass hover-lift"
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background: isPlaying ? 'color-mix(in srgb, var(--brand-ink) 5%, transparent)' : '',
                    borderColor: isPlaying ? 'var(--brand-ink)' : ''
                  }}
                  onClick={(event) => onPlaySurah?.(audioUrl, index, event)}
                >
                  <div className="settings-card-left">
                    <div
                      className="settings-icon-box"
                      style={{
                        background: isPlaying ? 'var(--brand-ink)' : 'var(--paper-sunken)',
                        color: isPlaying ? 'var(--on-primary)' : 'var(--brand-ink)',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%'
                      }}
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </div>
                    <div className="settings-user-info">
                      <div className="settings-label" style={{ color: isPlaying ? 'var(--brand-ink)' : '' }}>
                        {surah.number}. {surah.name}
                      </div>
                      <div className="settings-desc">
                        {surah.nameTranslation} • {surah.ayahCount} Ayet
                      </div>
                    </div>
                  </div>
                  {isPlaying ? (
                    <div className="audio-wave">
                      <span></span><span></span><span></span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reveal-stagger">
      <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
        {activeItem.description}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {reciters.map((reciter) => (
          <div
            key={reciter.id}
            className="settings-card reveal-stagger premium-glass hover-lift"
            style={{ padding: '16px', cursor: 'pointer' }}
            onClick={() => onSelectReciter?.(reciter)}
          >
            <div className="settings-card-left">
              <div
                className="settings-icon-box"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--paper-sunken)',
                  color: 'var(--brand-ink)'
                }}
              >
                <Mic size={20} />
              </div>
              <div className="settings-user-info">
                <div className="settings-label">{reciter.name}</div>
                <div className="settings-desc">{reciter.country}</div>
              </div>
            </div>
            <ChevronRight size={18} color="var(--ink-muted)" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReciterBrowser;
