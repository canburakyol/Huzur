import { registerPlugin } from '@capacitor/core';

const Widget = registerPlugin('Widget');

export const updateWidget = async (nextPrayer, timeRemaining, location) => {
    try {
        await Widget.updateWidget({
            nextPrayer,
            timeRemaining,
            location
        });
    } catch (error) {
        console.error("Widget update failed:", error);
    }
};
