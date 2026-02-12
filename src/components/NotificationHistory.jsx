import React, { useState, useEffect } from 'react';
import { getNotificationHistory, clearNotificationHistory } from '../services/smartNotificationService';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const NotificationHistory = () => {
    const { t } = useTranslation();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const loadHistory = () => {
          const data = getNotificationHistory();
          setHistory(data);
        };
        loadHistory();
    }, []);

    const handleClear = () => {
        if (window.confirm(t('settings.historyClearConfirm', 'Tüm bildirim geçmişini silmek istediğinize emin misiniz?'))) {
            clearNotificationHistory();
            setHistory([]);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'prayer': return '🕌';
            case 'prayer_pre': return '⏳';
            case 'streak': return '🔥';
            case 'reminder': return '📝';
            default: return '📢';
        }
    };

    const formatDate = (isoString) => {
        try {
            return format(new Date(isoString), 'd MMMM HH:mm', { locale: tr });
        } catch {
            return isoString;
        }
    };

    return (
        <div className="notification-history-container p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center">
                    <span className="text-2xl mr-2">📜</span> {t('settings.historyTitle', 'Bildirim Geçmişi')}
                </h2>
                {history.length > 0 && (
                    <button 
                        onClick={handleClear}
                        className="text-red-500 text-sm hover:text-red-700 underline"
                    >
                        {t('common.clear', 'Temizle')}
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="text-center text-gray-500 py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-4xl block mb-2">📭</span>
                    <p>{t('settings.historyEmpty', 'Henüz bildirim yok.')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {history.map((item, index) => (
                        <div 
                            key={index} 
                            className="notification-item bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-start"
                        >
                            <div className="text-2xl mr-3 mt-1 bg-gray-100 dark:bg-gray-700 rounded-full p-2 w-10 h-10 flex items-center justify-center">
                                {getIcon(item.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">{item.title}</h4>
                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                        {formatDate(item.timestamp)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.body}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationHistory;
