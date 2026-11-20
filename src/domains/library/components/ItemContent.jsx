import {
  Book,
  ChevronDown,
  ChevronRight,
  ListVideo,
  Pause,
  Play,
  Search,
  Volume2,
  Youtube
} from 'lucide-react';

function ItemContent({
  expandedIndex,
  item,
  onSpeakArabic,
  onToggleAudio,
  onToggleExpanded,
  playingIndex,
  t
}) {
  if (!item) {
    return null;
  }

  if (item.type === 'playlist') {
    return (
      <div className="reveal-stagger">
        <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
          {item.description}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {item.items.map((track, index) => {
            const isPlaying = playingIndex === index;

            return (
              <div
                key={`${track.title}-${index}`}
                className="settings-card reveal-stagger premium-glass hover-lift"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  background: isPlaying ? 'color-mix(in srgb, var(--brand-ink) 5%, transparent)' : '',
                  borderColor: isPlaying ? 'var(--brand-ink)' : ''
                }}
                onClick={(event) => onToggleAudio?.(track.url, index, event)}
              >
                <div className="settings-card-left">
                  <div
                    className="settings-icon-box"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: isPlaying ? 'var(--brand-ink)' : 'var(--paper-sunken)',
                      color: isPlaying ? 'var(--on-primary)' : 'var(--brand-ink)'
                    }}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </div>
                  <div className="settings-user-info">
                    <div className="settings-label" style={{ color: isPlaying ? 'var(--brand-ink)' : '' }}>
                      {track.title}
                    </div>
                    <div className="settings-desc">{track.duration}</div>
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
    );
  }

  if (item.type === 'prayer') {
    return (
      <div className="reveal-stagger">
        <div
          className="settings-card premium-glass hover-lift"
          style={{
            padding: '32px 24px',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '24px'
          }}
        >
          {item.prophet ? (
            <div
              className="hamburger-level-badge"
              style={{
                background: 'color-mix(in srgb, var(--brand-ink) 10%, transparent)',
                color: 'var(--brand-ink)',
                fontWeight: '900',
                border: '1px solid var(--brand-ink)'
              }}
            >
              {item.prophet}
            </div>
          ) : null}

          <h2
            style={{
              fontSize: '1.75rem',
              color: 'var(--ink)',
              margin: 0,
              fontWeight: '900',
              lineHeight: '1.2'
            }}
          >
            {t(item.title, { defaultValue: item.title })}
          </h2>

          {item.situation ? (
            <div
              style={{
                fontSize: '0.9rem',
                color: 'var(--ink-muted)',
                fontStyle: 'italic',
                padding: '0 16px'
              }}
            >
              "{item.situation}"
            </div>
          ) : null}

          <div
            style={{
              background: 'var(--paper-sunken)',
              padding: '32px 24px',
              borderRadius: '32px',
              width: '100%',
              border: '1px solid var(--line)'
            }}
          >
            <div
              style={{
                fontFamily: 'var(--arabic-font-family)',
                fontSize: '2rem',
                color: 'var(--ink)',
                lineHeight: '1.8',
                marginBottom: '24px',
                direction: 'rtl'
              }}
            >
              {item.arabic}
            </div>

            <div
              style={{
                fontSize: '1rem',
                color: 'var(--ink-muted)',
                marginBottom: '20px',
                lineHeight: '1.6',
                fontWeight: '600'
              }}
            >
              {item.transliteration || item.turkish}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '20px 0' }} />

            <div
              style={{
                fontSize: '1.1rem',
                color: 'var(--brand-ink)',
                fontWeight: '800',
                lineHeight: '1.6'
              }}
            >
              {t(item.meaning, { defaultValue: item.meaning })}
            </div>
          </div>

          {item.source ? (
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--ink-muted)',
                fontWeight: '700',
                opacity: 0.8
              }}
            >
              Source: {item.source}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (item.type === 'video') {
    return (
      <div className="reveal-stagger">
        <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
          {item.description}
        </p>

        <div
          className="settings-card premium-glass hover-lift"
          style={{
            marginBottom: '24px',
            padding: '24px',
            background: 'color-mix(in srgb, var(--brand-ink) 10%, transparent)',
            border: '1px solid var(--brand-ink)'
          }}
        >
          <div className="settings-card-left">
            <div className="settings-icon-box" style={{ width: '72px', height: '72px', background: 'var(--paper-raised)' }}>
              <span style={{ fontSize: '2.5rem' }}>{item.icon}</span>
            </div>
            <div className="settings-user-info">
              <div className="settings-label" style={{ fontSize: '1.1rem', color: 'var(--brand-ink)' }}>
                {item.episodes?.length || 0} {t('library.episodes', 'Bölüm')}
              </div>
              <div className="settings-desc" style={{ fontWeight: '800' }}>
                {t('library.premium_video', 'Premium Video Akademi')}
              </div>
            </div>
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-group-title premium-text">{t('library.episode_list', 'Bölüm Listesi')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {item.episodes?.map((episode, index) => (
              <div
                key={`${episode.title}-${index}`}
                className="settings-card reveal-stagger premium-glass hover-lift"
                style={{ padding: '16px', cursor: 'pointer' }}
              >
                <div className="settings-card-left">
                  <div
                    style={{
                      width: '64px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'var(--paper-sunken)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      position: 'relative',
                      border: '1px solid var(--line)'
                    }}
                  >
                    {episode.thumbnail}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'var(--brand-ink)',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                    >
                      <Play size={12} color='var(--on-primary)' fill='var(--on-primary)' />
                    </div>
                  </div>
                  <div className="settings-user-info">
                    <div className="settings-label" style={{ fontSize: '0.9rem' }}>
                      {episode.number}. {episode.title}
                    </div>
                    <div className="settings-desc">{episode.duration}</div>
                  </div>
                </div>
                <ChevronRight size={18} color="var(--ink-muted)" />
              </div>
            ))}
          </div>
        </div>

        <div
          className="settings-card"
          style={{
            marginTop: '32px',
            padding: '24px',
            justifyContent: 'center',
            background: 'var(--paper-sunken)',
            border: '1px dashed var(--line)'
          }}
        >
          <div style={{ textAlign: 'center', color: 'var(--ink-muted)', fontSize: '0.85rem', fontWeight: '700' }}>
            {t('library.videoComingSoon', 'Video içerikler yakında eklenecek')}
          </div>
        </div>
      </div>
    );
  }

  if (item.type === 'external_video') {
    const openYouTube = (url) => {
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    const youtubeSearchUrl = item.searchQuery
      ? `https://www.youtube.com/results?search_query=${encodeURIComponent(item.searchQuery)}`
      : null;

    return (
      <div className="reveal-stagger">
        <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
          {item.description}
        </p>

        <div
          className="settings-card"
          style={{
            marginBottom: '24px',
            padding: '20px',
            background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
            color: 'var(--on-primary)',
            border: 'none'
          }}
        >
          <div className="settings-card-left">
            <div className="settings-icon-box" style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', color: 'var(--on-primary)' }}>
              <Youtube size={28} fill='var(--on-primary)' />
            </div>
            <div className="settings-user-info">
              <div className="settings-label" style={{ color: 'var(--on-primary)', fontSize: '1.1rem' }}>
                {item.source}
              </div>
              <div className="settings-desc" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '700' }}>
                {t('library.youtubeChannel', { count: item.topics?.length || 0, defaultValue: 'YouTube Kanalı • {{count}} Konu' })}
              </div>
            </div>
          </div>
        </div>

        <div className="settings-group" style={{ marginBottom: '24px' }}>
          <div className="settings-group-title">{t('library.topics', 'İçerik Konuları')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {item.topics?.map((topic, index) => (
              <div
                key={`${topic}-${index}`}
                style={{
                  padding: '8px 16px',
                  background: 'var(--paper-sunken)',
                  borderRadius: '24px',
                  fontSize: '0.8rem',
                  color: 'var(--brand-ink)',
                  fontWeight: '800',
                  border: '1px solid var(--line)'
                }}
              >
                {topic}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {item.channelUrl ? (
            <button
              onClick={() => openYouTube(item.channelUrl)}
              className="velocity-target-btn"
              style={{
                width: '100%',
                background: '#ff0000',
                color: 'var(--on-primary)',
                borderColor: 'transparent',
                justifyContent: 'center',
                fontWeight: '900'
              }}
            >
              <Play size={20} fill='var(--on-primary)' /> {t('library.go_to_channel', 'YouTube Kanalına Git')}
            </button>
          ) : null}

          {item.playlistUrl ? (
            <button
              onClick={() => openYouTube(item.playlistUrl)}
              className="velocity-target-btn"
              style={{
                width: '100%',
                background: 'var(--paper-sunken)',
                borderColor: '#ff0000',
                color: '#ff0000',
                justifyContent: 'center'
              }}
            >
              <ListVideo size={20} /> {t('library.view_playlists', 'Oynatma Listelerini Gör')}
            </button>
          ) : null}

          {youtubeSearchUrl ? (
            <button
              onClick={() => openYouTube(youtubeSearchUrl)}
              className="velocity-target-btn"
              style={{
                width: '100%',
                background: 'transparent',
                color: 'var(--ink-muted)',
                justifyContent: 'center',
                borderColor: 'var(--line)'
              }}
            >
              <Search size={18} /> {t('library.search_on_youtube', "YouTube'da Ara")}
            </button>
          ) : null}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--ink-muted)', fontSize: '0.75rem', marginTop: '24px', padding: '0 20px', lineHeight: '1.5', fontWeight: '600' }}>
          {t('library.external_notice', 'Video içerikler harici kaynaklardan sağlanmaktadır. YouTube uygulamasına yönlendirileceksiniz.')}
        </p>
      </div>
    );
  }

  if (item.chapters) {
    return (
      <div className="reveal-stagger">
        <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
          {item.description}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {item.chapters.map((chapter, index) => {
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={`${chapter.title}-${index}`}
                className="settings-card reveal-stagger"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  flexDirection: 'column',
                  background: isExpanded ? 'color-mix(in srgb, var(--brand-ink) 3%, transparent)' : '',
                  borderColor: isExpanded ? 'var(--brand-ink)' : ''
                }}
                onClick={() => onToggleExpanded?.(index)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      className="settings-icon-box"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isExpanded ? 'var(--brand-ink)' : 'var(--paper-sunken)',
                        color: isExpanded ? 'var(--on-primary)' : 'var(--brand-ink)'
                      }}
                    >
                      <Book size={16} />
                    </div>
                    <div className="settings-label" style={{ fontWeight: '800', color: isExpanded ? 'var(--brand-ink)' : '' }}>
                      {chapter.title}
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown size={18} color="var(--brand-ink)" /> : <ChevronRight size={18} color="var(--ink-muted)" />}
                </div>
                {isExpanded ? (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '20px',
                      borderRadius: '16px',
                      background: 'var(--paper-sunken)',
                      fontSize: '1rem',
                      lineHeight: '1.8',
                      color: 'var(--ink)',
                      whiteSpace: 'pre-wrap',
                      border: '1px solid var(--line)'
                    }}
                  >
                    {chapter.content}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (item.items) {
    return (
      <div className="reveal-stagger">
        <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
          {item.description}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {item.items.map((entry, index) => {
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={`${entry.name || entry.title || entry.text}-${index}`}
                className="settings-card reveal-stagger"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  flexDirection: 'column',
                  background: isExpanded ? 'color-mix(in srgb, var(--brand-ink) 3%, transparent)' : '',
                  borderColor: isExpanded ? 'var(--brand-ink)' : ''
                }}
                onClick={() => onToggleExpanded?.(index)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                  <div
                    style={{
                      background: isExpanded ? 'var(--brand-ink)' : 'var(--paper-sunken)',
                      color: isExpanded ? 'var(--on-primary)' : 'var(--brand-ink)',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: '900',
                      flexShrink: 0
                    }}
                  >
                    {entry.number}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: '800',
                        color: isExpanded ? 'var(--brand-ink)' : 'var(--ink)',
                        fontSize: '1rem'
                      }}
                    >
                      {entry.title || entry.name || entry.text}
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown size={18} color="var(--brand-ink)" /> : <ChevronRight size={18} color="var(--ink-muted)" />}
                </div>

                {entry.arabic && !isExpanded ? (
                  <div
                    style={{
                      width: '100%',
                      fontFamily: 'var(--arabic-font-family)',
                      fontSize: '1.5rem',
                      textAlign: 'right',
                      direction: 'rtl',
                      color: 'var(--ink-muted)',
                      marginTop: '8px',
                      opacity: 0.6
                    }}
                  >
                    {entry.arabic}
                  </div>
                ) : null}

                {isExpanded ? (
                  <div style={{ marginTop: '16px', width: '100%' }}>
                    {entry.arabic ? (
                      <div
                        style={{
                          fontFamily: 'var(--arabic-font-family)',
                          fontSize: '2.2rem',
                          textAlign: 'center',
                          direction: 'rtl',
                          color: 'var(--ink)',
                          padding: '24px',
                          background: 'var(--paper-sunken)',
                          borderRadius: '24px',
                          marginBottom: '16px',
                          lineHeight: '1.5'
                        }}
                      >
                        {entry.arabic}
                      </div>
                    ) : null}
                    <div
                      style={{
                        padding: '20px',
                        borderRadius: '24px',
                        background: 'var(--paper-sunken)',
                        fontSize: '0.95rem',
                        lineHeight: '1.7',
                        color: 'var(--ink)',
                        border: '1px solid var(--line)'
                      }}
                    >
                      {entry.text ? (
                        <div style={{ fontWeight: '800', marginBottom: '8px', color: 'var(--brand-ink)' }}>
                          {t('library.pronunciation', 'Okunuşu')}: <span style={{ fontWeight: '600', color: 'var(--ink)' }}>{entry.text}</span>
                        </div>
                      ) : null}
                      <div style={{ fontWeight: '600' }}>{entry.explanation || entry.meaning || entry.description}</div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (item.topics) {
    return (
      <div className="reveal-stagger">
        <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
          {item.description}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {item.topics.map((topic, index) => {
            const isExpanded = expandedIndex === index;
            const isPlaying = playingIndex === index;

            return (
              <div
                key={`${topic.title || topic.name || topic.letter}-${index}`}
                className="settings-card reveal-stagger"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  flexDirection: 'column',
                  background: isExpanded ? 'color-mix(in srgb, var(--brand-ink) 3%, transparent)' : '',
                  borderColor: isPlaying ? 'var(--brand-ink)' : (isExpanded ? 'var(--brand-ink)' : '')
                }}
                onClick={() => onToggleExpanded?.(index)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {topic.letter ? (
                      <div
                        style={{
                          fontSize: '2.5rem',
                          fontFamily: 'var(--arabic-font-family)',
                          color: isPlaying ? 'var(--brand-ink)' : 'var(--ink)',
                          width: '48px',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--paper-sunken)',
                          borderRadius: '12px',
                          transition: 'all 0.3s'
                        }}
                      >
                        {topic.letter}
                      </div>
                    ) : null}
                    <div>
                      <div style={{ fontWeight: '800', color: isExpanded ? 'var(--brand-ink)' : 'var(--ink)', fontSize: '1.1rem' }}>
                        {topic.title || topic.name}
                      </div>
                      {topic.pronunciation ? (
                        <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontWeight: '600' }}>
                          {t('library.pronunciation', 'Okunuşu')}: {topic.pronunciation}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {topic.letter ? (
                      <button
                        onClick={(event) => onSpeakArabic?.(topic.letter, index, event)}
                        style={{
                          background: isPlaying ? 'var(--brand-ink)' : 'var(--paper-sunken)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isPlaying ? '0 0 12px color-mix(in srgb, var(--brand-ink) 30%, transparent)' : 'none'
                        }}
                      >
                        <Volume2 size={20} color={isPlaying ? 'var(--on-primary)' : 'var(--brand-ink)'} />
                      </button>
                    ) : null}
                    {isExpanded ? <ChevronDown size={18} color="var(--brand-ink)" /> : <ChevronRight size={18} color="var(--ink-muted)" />}
                  </div>
                </div>
                {isExpanded ? (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '20px',
                      borderRadius: '24px',
                      background: 'var(--paper-sunken)',
                      fontSize: '0.95rem',
                      lineHeight: '1.8',
                      color: 'var(--ink)',
                      border: '1px solid var(--line)'
                    }}
                  >
                    {topic.content || topic.description}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (item.questions) {
    return (
      <div className="reveal-stagger">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {item.questions.map((question, index) => {
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={`${question.q}-${index}`}
                className="settings-card reveal-stagger"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  flexDirection: 'column',
                  background: isExpanded ? 'color-mix(in srgb, var(--brand-ink) 3%, transparent)' : '',
                  borderColor: isExpanded ? 'var(--brand-ink)' : ''
                }}
                onClick={() => onToggleExpanded?.(index)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', gap: '16px' }}>
                  <div style={{ fontWeight: '800', color: isExpanded ? 'var(--brand-ink)' : 'var(--ink)', fontSize: '0.95rem', flex: 1 }}>
                    {question.q}
                  </div>
                  {isExpanded ? <ChevronDown size={18} color="var(--brand-ink)" /> : <ChevronRight size={18} color="var(--ink-muted)" />}
                </div>
                {isExpanded ? (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '20px',
                      borderRadius: '24px',
                      background: 'var(--paper-sunken)',
                      fontSize: '0.95rem',
                      lineHeight: '1.7',
                      color: 'var(--ink)',
                      border: '1px solid var(--line)'
                    }}
                  >
                    {question.a}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

export default ItemContent;
