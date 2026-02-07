import { useState, useEffect, useRef } from 'react';
import { adMobService } from '../services/admobService';
import { isPro } from '../services/proService';

const popupStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: '50px',
        animation: 'fadeIn 0.28s ease-out'
    },
    titleBox: {
        color: 'var(--text-color)',
        marginBottom: '350px',
        textAlign: 'center',
        padding: '20px',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
    },
    closeButton: {
        backgroundColor: 'var(--accent-vibrant)',
        color: '#1a1a1a',
        border: '2px solid color-mix(in srgb, var(--accent-vibrant) 65%, white)',
        padding: '15px 40px',
        borderRadius: '30px',
        fontSize: '18px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        marginBottom: '50px',
        transition: 'var(--transition-smooth)'
    }
};

const POPUP_INTERVAL = 300000; // 5 minutes (in milliseconds) - Policy compliant
const MAX_POPUPS_PER_SESSION = 2; // Maximum popups per session to avoid disruption

const AdPopup = () => {
    const [showPopup, setShowPopup] = useState(false);
    const popupCountRef = useRef(0);
    const isMountedRef = useRef(true);
    const timerRef = useRef(null);

    useEffect(() => {
        isMountedRef.current = true;

        const clearPopupTimer = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };

        // Skip ads for Pro users
        if (isPro()) {
            clearPopupTimer();
            return;
        }

        const startTimer = () => {
            // Don't schedule if max popups reached
            if (popupCountRef.current >= MAX_POPUPS_PER_SESSION) {
                return;
            }

            clearPopupTimer();

            timerRef.current = setTimeout(async () => {
                // Double-check limit and Pro status before showing
                if (!isMountedRef.current || popupCountRef.current >= MAX_POPUPS_PER_SESSION || isPro()) {
                    return;
                }

                // 1. Hide bottom banner
                await adMobService.hideBanner();

                // 2. Show popup ad (Medium Rectangle)
                await adMobService.showMediumRectangle();

                // 3. Show overlay UI
                if (isMountedRef.current) {
                    setShowPopup(true);
                    popupCountRef.current += 1;
                }
            }, POPUP_INTERVAL);
        };

        startTimer();

        // Cleanup on unmount
        return () => {
            isMountedRef.current = false;
            clearPopupTimer();
        };
    }, []); // Run once on mount

    const handleClose = async () => {
        // 1. Hide popup ad
        await adMobService.hideBanner();

        // 2. Hide overlay UI
        setShowPopup(false);

        // 3. Restore bottom banner
        await adMobService.showRectangleBanner();

        // 4. Restart timer if under session limit
        if (popupCountRef.current < MAX_POPUPS_PER_SESSION) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(async () => {
                if (!isMountedRef.current || popupCountRef.current >= MAX_POPUPS_PER_SESSION || isPro()) return;

                await adMobService.hideBanner();
                await adMobService.showMediumRectangle();
                if (!isMountedRef.current) return;
                setShowPopup(true);
                popupCountRef.current += 1;
            }, POPUP_INTERVAL);
        }
    };

    if (!showPopup) return null;

    return (
        <div style={popupStyles.overlay}>
            {/* 
        Native Ad will appear in the CENTER of the screen.
        We don't need to render a placeholder for it, 
        but we need to make sure our Close button is visible.
      */}

            <div style={popupStyles.titleBox}>
                <h2>Sponsorlu İçerik</h2>
            </div>

            <button
                onClick={handleClose}
                style={popupStyles.closeButton}
            >
                REKLAMI KAPAT ✕
            </button>
        </div>
    );
};

export default AdPopup;
