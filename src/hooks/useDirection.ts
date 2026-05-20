import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { logger } from "../utils/logger";

const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

interface DirectionResult {
  isRTL: boolean;
  direction: "rtl" | "ltr";
  language: string;
}

export const useDirection = (): DirectionResult => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = i18n.language?.split("-")[0] || "tr";
    const isRTL = RTL_LANGUAGES.includes(currentLang);

    document.body.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = currentLang;

    document.documentElement.setAttribute("data-direction", isRTL ? "rtl" : "ltr");

    logger.log(`[useDirection] Language: ${currentLang}, Direction: ${isRTL ? "RTL" : "LTR"}`);

    return () => {
      // Cleanup on unmount (optional)
    };
  }, [i18n.language]);

  const currentLang = i18n.language?.split("-")[0] || "tr";
  const isRTL = RTL_LANGUAGES.includes(currentLang);

  return {
    isRTL,
    direction: isRTL ? "rtl" : "ltr",
    language: i18n.language,
  };
};

export default useDirection;
