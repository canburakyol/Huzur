import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const HomeQuickAccessStrip = memo(({ onSelectFeature }) => {
  const { t } = useTranslation();

  const shortcuts = [
    { id: 'qibla', icon: 'explore', label: 'Kıble' },
    { id: 'zikirmatik', icon: 'counter_1', label: 'Zikirmatik' },
    { id: 'dualar', icon: 'front_hand', label: 'Dualar' },
    { id: 'mosque', icon: 'mosque', label: 'Camiim' },
    { id: 'zekat', icon: 'account_balance_wallet', label: 'Zekat' },
    { id: 'tafsir', icon: 'menu_book', label: 'Tefsir' },
    { id: 'tesbihat', icon: 'potted_plant', label: 'Tesbihat' },
    { id: 'calendar', icon: 'calendar_month', label: 'Takvim' },
  ];

  return (
    <section className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold font-plus-jakarta text-primary">
          {t('features.quickAccess', 'Hızlı Erişim')}
        </h2>
        <div className="flex gap-4">
          <button className="text-[12px] font-semibold text-primary bg-transparent border-none cursor-pointer">Düzenle</button>
          <button className="text-[12px] font-semibold text-sage-deep/70 bg-transparent border-none cursor-pointer">Tümünü Gör</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.id}
            onClick={() => onSelectFeature(shortcut.id, 'home_quick_access')}
            className="flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <div className="w-full aspect-square rounded-premium bg-white flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300 border border-primary/10 shadow-sm">
              <span className="material-symbols-outlined text-2xl">{shortcut.icon}</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-center tracking-normal text-primary">
              {shortcut.label}
            </span>
          </div>
        ))}
        {/* Ekle Butonu */}
        <div className="flex flex-col items-center gap-1.5 cursor-pointer">
          <div className="w-full aspect-square rounded-premium bg-primary/10 flex items-center justify-center text-primary border border-dashed border-primary/30 hover:bg-primary/20 transition-all duration-300">
            <span className="material-symbols-outlined text-2xl">add</span>
          </div>
          <span className="text-[10px] font-bold uppercase text-center tracking-normal text-primary">
            Ekle
          </span>
        </div>
      </div>
    </section>
  );
});

HomeQuickAccessStrip.displayName = 'HomeQuickAccessStrip';

export default HomeQuickAccessStrip;
