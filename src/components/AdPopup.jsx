import { useState, useEffect, useRef } from 'react';
import { adMobService } from '../services/admobService';
import { isPro } from '../services/proService';

const POPUP_INTERVAL = 300000; // 5 minutes (in milliseconds) - Policy compliant
const MAX_POPUPS_PER_SESSION = 2; // Maximum popups per session to avoid disruption

const AdPopup = () => {
    const [showPopup, setShowPopup] = useState(false);
    const popupCountRef = useRef(0);

    useEffect(() => {
        let isMounted = true;
        // Skip ads for Pro users
        if (isPro()) {
            return;
        }

        let timer;

        const startTimer = () => {
            // Don't schedule if max popups reached
            if (popupCountRef.current >= MAX_POPUPS_PER_SESSION) {
                return;
            }

            timer = setTimeout(async () => {
                // Double-check limit and Pro status before showing
                if (!isMounted || popupCountRef.current >= MAX_POPUPS_PER_SESSION || isPro()) {
                    return;
                }

                // 1. Hide bottom banner
                await adMobService.hideBanner();

                // 2. Show popup ad (Medium Rectangle)
                await adMobService.showMediumRectangle();

                // 3. Show overlay UI
                if (isMounted) {
                    setShowPopup(true);
                    popupCountRef.current += 1;
                }
            }, POPUP_INTERVAL);
        };

        startTimer();

        // Cleanup on unmount
        return () => {
            isMounted = false;
            if (timer) clearTimeout(timer);
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
            setTimeout(async () => {
                if (popupCountRef.current >= MAX_POPUPS_PER_SESSION) return;

                await adMobService.hideBanner();
                await adMobService.showMediumRectangle();
                setShowPopup(true);
                popupCountRef.current += 1;
            }, POPUP_INTERVAL);
        }
    };

    if (!showPopup) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.85)', // Dark overlay
            zIndex: 9999, // High z-index to cover app
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end', // Push content to bottom
            paddingBottom: '50px'
        }}>
            {/* 
        Native Ad will appear in the CENTER of the screen.
        We don't need to render a placeholder for it, 
        but we need to make sure our Close button is visible.
      */}

            <div style={{
                color: 'white',
                marginBottom: '350px', // Push text above the ad (approx)
                textAlign: 'center',
                padding: '20px'
            }}>
                <h2>Sponsorlu İçerik</h2>
            </div>

            <button
                onClick={handleClose}
                style={{
                    backgroundColor: '#D4A574', // App theme color
                    color: 'white',
                    border: '2px solid white',
                    padding: '15px 40px',
                    borderRadius: '30px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    marginBottom: '50px' // Space from bottom
                }}
            >
                REKLAMI KAPAT ✕
            </button>
        </div>
    );
};

export default AdPopup;
