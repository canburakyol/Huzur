import { createElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, BellOff, Clock, Flame, Landmark, NotebookPen } from 'lucide-react';
import { getNotificationHistory, clearNotificationHistory } from '../../../services/smartNotificationService';
import '../../../styles/PracticePages.css';

const TYPE_ICONS = { prayer: Landmark, prayer_pre: Clock, streak: Flame, reminder: NotebookPen };

const NotificationHistory = () => {
    const { t, i18n } = useTranslation();
    const [history, setHistory] = useState(() => getNotificationHistory());

    const handleClear = () => {
        if (window.confirm(t('settings.historyClearConfirm', 'Tüm bildirim geçmişini silmek istediğinize emin misiniz?'))) {
            clearNotificationHistory();
            setHistory([]);
        }
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) return isoString;
        return new Intl.DateTimeFormat(i18n.language || 'tr', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(date);
    };

    if (history.length === 0) {
        return (
            <div className="practice-page">
                <div className="practice-empty">
                    <BellOff size={28} aria-hidden="true" />
                    <p>{t('settings.historyEmpty', 'Henüz bildirim yok.')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="practice-page">
            <div className="practice-list">
                {history.map((item, index) => (
                    <div key={item.id ?? index} className="practice-row">
                        <span className="practice-row__icon">
                            {createElement(TYPE_ICONS[item.type] || Bell, { size: 18, strokeWidth: 1.75, 'aria-hidden': true })}
                        </span>
                        <span className="practice-row__body">
                            <span className="practice-row__title">{item.title}</span>
                            <span className="practice-row__text">{item.body}</span>
                            <span className="practice-row__meta"><span className="practice-pill">{formatDate(item.timestamp)}</span></span>
                        </span>
                    </div>
                ))}
            </div>
            <div className="practice-actions">
                <button type="button" className="practice-secondary-button practice-wide" onClick={handleClear}>
                    {t('common.clear', 'Temizle')}
                </button>
            </div>
        </div>
    );
};

export default NotificationHistory;
