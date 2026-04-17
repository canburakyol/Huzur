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
        <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
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
                  background: isPlaying ? 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.05)' : '',
                  borderColor: isPlaying ? 'var(--nav-accent)' : ''
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
                      background: isPlaying ? 'var(--nav-accent)' : 'var(--nav-hover)',
                      color: isPlaying ? 'white' : 'var(--nav-accent)'
                    }}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </div>
                  <div className="settings-user-info">
                    <div className="settings-label" style={{ color: isPlaying ? 'var(--nav-accent)' : '' }}>
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
                background: 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.1)',
                color: 'var(--nav-accent)',
                fontWeight: '900',
                border: '1px solid var(--nav-accent)'
              }}
            >
              {item.prophet}
            </div>
          ) : null}

          <h2
            style={{
              fontSize: '1.75rem',
              color: 'var(--nav-text)',
              margin: 0,
              fontWeight: '900',
              lineHeight: '1.2'
            }}
          >
            {t(item.title, { ns: 'prayers', defaultValue: item.title })}
          </h2>

          {item.situation ? (
            <div
              style={{
                fontSize: '0.9rem',
                color: 'var(--nav-text-muted)',
                fontStyle: 'italic',
                padding: '0 16px'
              }}
            >
              "{item.situation}"
            </div>
          ) : null}

          <div
            style={{
              background: 'var(--nav-hover)',
              padding: '32px 24px',
              borderRadius: '32px',
              width: '100%',
              border: '1px solid var(--nav-border)'
            }}
          >
            <div
              style={{
                fontFamily: 'var(--arabic-font-family)',
                fontSize: '2rem',
                color: 'var(--nav-text)',
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
                color: 'var(--nav-text-muted)',
                marginBottom: '20px',
                lineHeight: '1.6',
                fontWeight: '600'
              }}
            >
              {item.transliteration || item.turkish}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--nav-border)', margin: '20px 0' }} />

            <div
              style={{
                fontSize: '1.1rem',
                color: 'var(--nav-accent)',
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
                color: 'var(--nav-text-muted)',
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
        <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
          {item.description}
        </p>

        <div
          className="settings-card premium-glass hover-lift"
          style={{
            marginBottom: '24px',
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(var(--nav-accent-rgb, 249, 115, 22), 0.1), rgba(59, 130, 246, 0.1))',
            border: '1px solid var(--nav-accent)'
          }}
        >
          <div className="settings-card-left">
            <div className="settings-icon-box" style={{ width: '72px', height: '72px', background: 'white' }}>
              <span style={{ fontSize: '2.5rem' }}>{item.icon}</span>
            </div>
            <div className="settings-user-info">
              <div className="settings-label" style={{ fontSize: '1.1rem', color: 'var(--nav-accent)' }}>
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
                      background: 'var(--nav-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      position: 'relative',
                      border: '1px solid var(--nav-border)'
                    }}
                  >
                    {episode.thumbnail}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'var(--nav-accent)',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                    >
                      <Play size={12} color="#fff" fill="white" />
                    </div>
                  </div>
                  <div className="settings-user-info">
                    <div className="settings-label" style={{ fontSize: '0.9rem' }}>
                      {episode.number}. {episode.title}
                    </div>
                    <div className="settings-desc">⏱️ {episode.duration}</div>
                  </div>
                </div>
                <ChevronRight size={18} color="var(--nav-text-muted)" />
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
            background: 'var(--nav-hover)',
            border: '1px dashed var(--nav-border)'
          }}
        >
          <div style={{ textAlign: 'center', color: 'var(--nav-text-muted)', fontSize: '0.85rem', fontWeight: '700' }}>
            🎬 Video içerikler yakında eklenecek
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
        <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
          {item.description}
        </p>

        <div
          className="settings-card"
          style={{
            marginBottom: '24px',
            padding: '20px',
            background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
            color: 'white',
            border: 'none'
          }}
        >
          <div className="settings-card-left">
            <div className="settings-icon-box" style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', color: 'white' }}>
              <Youtube size={28} fill="white" />
            </div>
            <div className="settings-user-info">
              <div className="settings-label" style={{ color: 'white', fontSize: '1.1rem' }}>
                {item.source}
              </div>
              <div className="settings-desc" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '700' }}>
                YouTube Kanalı • {item.topics?.length || 0} Konu
              </div>
            </div>
          </div>
        </div>

        <div className="settings-group" style={{ marginBottom: '24px' }}>
          <div className="settings-group-title">📚 {t('library.topics', 'İçerik Konuları')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {item.topics?.map((topic, index) => (
              <div
                key={`${topic}-${index}`}
                style={{
                  padding: '8px 16px',
                  background: 'var(--nav-hover)',
                  borderRadius: '24px',
                  fontSize: '0.8rem',
                  color: 'var(--nav-accent)',
                  fontWeight: '800',
                  border: '1px solid var(--nav-border)'
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
                color: 'white',
                borderColor: 'transparent',
                justifyContent: 'center',
                fontWeight: '900'
              }}
            >
              <Play size={20} fill="white" /> {t('library.go_to_channel', 'YouTube Kanalına Git')}
            </button>
          ) : null}

          {item.playlistUrl ? (
            <button
              onClick={() => openYouTube(item.playlistUrl)}
              className="velocity-target-btn"
              style={{
                width: '100%',
                background: 'var(--nav-hover)',
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
                color: 'var(--nav-text-muted)',
                justifyContent: 'center',
                borderColor: 'var(--nav-border)'
              }}
            >
              <Search size={18} /> {t('library.search_on_youtube', "YouTube'da Ara")}
            </button>
          ) : null}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--nav-text-muted)', fontSize: '0.75rem', marginTop: '24px', padding: '0 20px', lineHeight: '1.5', fontWeight: '600' }}>
          ℹ️ {t('library.external_notice', 'Video içerikler harici kaynaklardan sağlanmaktadır. YouTube uygulamasına yönlendirileceksiniz.')}
        </p>
      </div>
    );
  }

  if (item.chapters) {
    return (
      <div className="reveal-stagger">
        <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
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
                  background: isExpanded ? 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.03)' : '',
                  borderColor: isExpanded ? 'var(--nav-accent)' : ''
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
                        background: isExpanded ? 'var(--nav-accent)' : 'var(--nav-hover)',
                        color: isExpanded ? 'white' : 'var(--nav-accent)'
                      }}
                    >
                      <Book size={16} />
                    </div>
                    <div className="settings-label" style={{ fontWeight: '800', color: isExpanded ? 'var(--nav-accent)' : '' }}>
                      {chapter.title}
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown size={18} color="var(--nav-accent)" /> : <ChevronRight size={18} color="var(--nav-text-muted)" />}
                </div>
                {isExpanded ? (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '20px',
                      borderRadius: '16px',
                      background: 'var(--nav-hover)',
                      fontSize: '1rem',
                      lineHeight: '1.8',
                      color: 'var(--nav-text)',
                      whiteSpace: 'pre-wrap',
                      border: '1px solid var(--nav-border)'
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
        <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
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
                  background: isExpanded ? 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.03)' : '',
                  borderColor: isExpanded ? 'var(--nav-accent)' : ''
                }}
                onClick={() => onToggleExpanded?.(index)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                  <div
                    style={{
                      background: isExpanded ? 'var(--nav-accent)' : 'var(--nav-hover)',
                      color: isExpanded ? 'white' : 'var(--nav-accent)',
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
                        color: isExpanded ? 'var(--nav-accent)' : 'var(--nav-text)',
                        fontSize: '1rem'
                      }}
                    >
                      {entry.title || entry.name || entry.text}
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown size={18} color="var(--nav-accent)" /> : <ChevronRight size={18} color="var(--nav-text-muted)" />}
                </div>

                {entry.arabic && !isExpanded ? (
                  <div
                    style={{
                      width: '100%',
                      fontFamily: 'var(--arabic-font-family)',
                      fontSize: '1.5rem',
                      textAlign: 'right',
                      direction: 'rtl',
                      color: 'var(--nav-text-muted)',
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
                          color: 'var(--nav-text)',
                          padding: '24px',
                          background: 'var(--nav-hover)',
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
                        background: 'var(--nav-hover)',
                        fontSize: '0.95rem',
                        lineHeight: '1.7',
                        color: 'var(--nav-text)',
                        border: '1px solid var(--nav-border)'
                      }}
                    >
                      {entry.text ? (
                        <div style={{ fontWeight: '800', marginBottom: '8px', color: 'var(--nav-accent)' }}>
                          {t('library.pronunciation', 'Okunuşu')}: <span style={{ fontWeight: '600', color: 'var(--nav-text)' }}>{entry.text}</span>
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
        <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
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
                  background: isExpanded ? 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.03)' : '',
                  borderColor: isPlaying ? 'var(--nav-accent)' : (isExpanded ? 'var(--nav-accent)' : '')
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
                          color: isPlaying ? 'var(--nav-accent)' : 'var(--nav-text)',
                          width: '48px',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--nav-hover)',
                          borderRadius: '12px',
                          transition: 'all 0.3s'
                        }}
                      >
                        {topic.letter}
                      </div>
                    ) : null}
                    <div>
                      <div style={{ fontWeight: '800', color: isExpanded ? 'var(--nav-accent)' : 'var(--nav-text)', fontSize: '1.1rem' }}>
                        {topic.title || topic.name}
                      </div>
                      {topic.pronunciation ? (
                        <div style={{ fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
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
                          background: isPlaying ? 'var(--nav-accent)' : 'var(--nav-hover)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isPlaying ? '0 0 12px rgba(var(--nav-accent-rgb), 0.3)' : 'none'
                        }}
                      >
                        <Volume2 size={20} color={isPlaying ? '#fff' : 'var(--nav-accent)'} />
                      </button>
                    ) : null}
                    {isExpanded ? <ChevronDown size={18} color="var(--nav-accent)" /> : <ChevronRight size={18} color="var(--nav-text-muted)" />}
                  </div>
                </div>
                {isExpanded ? (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '20px',
                      borderRadius: '24px',
                      background: 'var(--nav-hover)',
                      fontSize: '0.95rem',
                      lineHeight: '1.8',
                      color: 'var(--nav-text)',
                      border: '1px solid var(--nav-border)'
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
                  background: isExpanded ? 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.03)' : '',
                  borderColor: isExpanded ? 'var(--nav-accent)' : ''
                }}
                onClick={() => onToggleExpanded?.(index)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', gap: '16px' }}>
                  <div style={{ fontWeight: '800', color: isExpanded ? 'var(--nav-accent)' : 'var(--nav-text)', fontSize: '0.95rem', flex: 1 }}>
                    {question.q}
                  </div>
                  {isExpanded ? <ChevronDown size={18} color="var(--nav-accent)" /> : <ChevronRight size={18} color="var(--nav-text-muted)" />}
                </div>
                {isExpanded ? (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '20px',
                      borderRadius: '24px',
                      background: 'var(--nav-hover)',
                      fontSize: '0.95rem',
                      lineHeight: '1.7',
                      color: 'var(--nav-text)',
                      border: '1px solid var(--nav-border)'
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
