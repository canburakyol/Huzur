import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getDailyDiscoveryCards, CARD_TYPE_CONFIG } from '../data/discoveryData';
import { useGamification } from '../hooks/useGamification';
import { storageService } from '../services/storageService';
import { recordDiscoveryView } from '../services/engagementSummaryService';
import { navigateFromAction } from '../utils/actionNavigation';
import { ChevronRight, Sparkles, Check } from 'lucide-react';

const DISCOVERY_STORAGE_KEY = 'huzur_daily_discovery';

const DailyDiscovery = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { addPoints } = useGamification();

  const cards = useMemo(() => getDailyDiscoveryCards(), []);

  const [viewedCards, setViewedCards] = useState(() => {
    const saved = storageService.getItem(DISCOVERY_STORAGE_KEY, {});
    const today = new Date().toDateString();
    if (saved.date !== today) return { date: today, viewed: [] };
    return saved;
  });

  const handleCardTap = useCallback((card) => {
    // Mark as viewed and award XP (only once)
    if (!viewedCards.viewed.includes(card.id)) {
      const updated = {
        ...viewedCards,
        viewed: [...viewedCards.viewed, card.id]
      };
      setViewedCards(updated);
      storageService.setItem(DISCOVERY_STORAGE_KEY, updated);
      recordDiscoveryView(1);
      addPoints(card.xp || 5, { source: 'daily_discovery' });
    }

    // Navigate to related feature if available
    if (card.action) {
      navigateFromAction(card.action, onNavigate);
    }
  }, [viewedCards, addPoints, onNavigate]);

  const isViewed = (cardId) => viewedCards.viewed.includes(cardId);

  return (
    <div className="reveal-stagger" style={{ margin: '20px' }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--nav-accent)" />
          <h3 style={{
            margin: 0, fontSize: '0.9rem', fontWeight: '900',
            color: 'var(--nav-text)', textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {t('discovery.title', 'Günlük Keşif')}
          </h3>
        </div>
        <span style={{
          fontSize: '0.7rem', fontWeight: '800',
          color: 'var(--nav-text-muted)', textTransform: 'uppercase'
        }}>
          {viewedCards.viewed.length}/{cards.length} {t('discovery.explored', 'Keşfedildi')}
        </span>
      </div>

      {/* Horizontal scrolling card list */}
      <div style={{
        display: 'flex', gap: '12px',
        overflowX: 'auto', scrollSnapType: 'x mandatory',
        paddingBottom: '4px',
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}>
        {cards.map((card, index) => {
          const config = CARD_TYPE_CONFIG[card.type] || CARD_TYPE_CONFIG.fact;
          const viewed = isViewed(card.id);

          return (
            <div
              key={card.id}
              className="reveal-stagger"
              onClick={() => handleCardTap(card)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCardTap(card)}
              style={{
                minWidth: '260px', maxWidth: '280px',
                scrollSnapAlign: 'start',
                background: config.gradient,
                borderRadius: '20px', padding: '20px',
                cursor: 'pointer',
                position: 'relative', overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: viewed
                  ? 'none'
                  : '0 4px 20px rgba(0,0,0,0.15)',
                opacity: viewed ? 0.75 : 1,
                '--delay': `${index * 0.08}s`,
                flexShrink: 0
              }}
            >
              {/* Decorative circle */}
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '80px', height: '80px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)'
              }} />

              {/* Viewed badge */}
              {viewed && (
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%', padding: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Check size={12} color="#fff" />
                </div>
              )}

              {/* Category label */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '1rem' }}>{card.icon}</span>
                <span style={{
                  fontSize: '0.65rem', fontWeight: '800',
                  color: 'rgba(255,255,255,0.7)',
                  textTransform: 'uppercase', letterSpacing: '1px'
                }}>
                  {card.label}
                </span>
              </div>

              {/* Card content */}
              <div style={{
                fontSize: '0.85rem', fontWeight: '700',
                color: '#fff', lineHeight: '1.5',
                marginBottom: '12px',
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {card.title}
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{
                  fontSize: '0.65rem', fontWeight: '700',
                  color: 'rgba(255,255,255,0.5)'
                }}>
                  {card.source}
                </span>
                {!viewed && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '0.65rem', fontWeight: '800',
                    color: 'rgba(255,255,255,0.7)'
                  }}>
                    +{card.xp} XP <ChevronRight size={12} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom scrollbar hide */}
      <style>{`
        .daily-discovery-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default DailyDiscovery;
