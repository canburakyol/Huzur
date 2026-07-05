import { Compass } from 'lucide-react';

function NavigationUpdateNotice({ onAcknowledge }) {
  return (
    <div className="navigation-update-backdrop" role="presentation">
      <section
        className="navigation-update-notice"
        role="dialog"
        aria-modal="true"
        aria-labelledby="navigation-update-title"
        aria-describedby="navigation-update-description"
      >
        <div className="navigation-update-icon" aria-hidden="true">
          <Compass size={24} strokeWidth={1.8} />
        </div>
        <h2 id="navigation-update-title">Her şey yerli yerinde</h2>
        <p id="navigation-update-description">
          Arayüzümüz artık çok daha sade ve huzurlu! Aradığınız tüm manevi araçları
          (Kur&apos;an, Zikirmatik, AI) sizin için &apos;Keşfet&apos; sekmesinde çok daha düzenli
          bir şekilde bir araya getirdik.
        </p>
        <button type="button" onClick={onAcknowledge} autoFocus>
          Anladım
        </button>
      </section>
    </div>
  );
}

export default NavigationUpdateNotice;
