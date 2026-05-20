import { useEffect, useRef, useState } from "react";
import i18n from "../i18n";

const ATTRIBUTES_TO_LOCALIZE = ["placeholder", "title", "aria-label"];
const AUTO_LOCALIZE_ROOT_SELECTOR = '[data-i18n-autolocalize="true"]';
const AUTO_LOCALIZE_EXCLUDE_SELECTOR =
  '[data-i18n-autolocalize="false"], [contenteditable="true"], input, textarea, select, option';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const flattenLeafValuesByKey = (obj: Record<string, unknown>, prefix = "", output = new Map<string, string>()): Map<string, string> => {
  if (!isPlainObject(obj)) {
    return output;
  }

  Object.entries(obj).forEach(([key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (isPlainObject(value)) {
      flattenLeafValuesByKey(value, nextKey, output);
      return;
    }

    if (typeof value === "string" && value.trim()) {
      output.set(nextKey, value.trim());
    }
  });

  return output;
};

const extractNormalizedLanguage = (languageCode: string | undefined): string => {
  if (!languageCode || typeof languageCode !== "string") {
    return "tr";
  }

  return languageCode.toLowerCase().split("-")[0];
};

const isSkippableContainer = (node: Node | null): boolean => {
  const element = node?.nodeType === Node.ELEMENT_NODE ? (node as Element) : node?.parentElement;
  if (!element) {
    return false;
  }

  const tagName = element.tagName;
  if (!tagName) {
    return false;
  }

  return ["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA"].includes(tagName);
};

const preserveWhitespaceReplace = (source: string, replacement: string): string => {
  const leading = source.match(/^\s*/)?.[0] || "";
  const trailing = source.match(/\s*$/)?.[0] || "";
  return `${leading}${replacement}${trailing}`;
};

const getElementForNode = (node: Node | null): Element | null => {
  if (!node) {
    return null;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    return node as Element;
  }

  return node.parentElement || null;
};

const isWithinAutoLocalizeScope = (node: Node): boolean => {
  const element = getElementForNode(node);
  if (!element) {
    return false;
  }

  if (!element.closest(AUTO_LOCALIZE_ROOT_SELECTOR)) {
    return false;
  }

  if (element.closest(AUTO_LOCALIZE_EXCLUDE_SELECTOR)) {
    return false;
  }

  return true;
};

const isAutoLocalizeCandidate = (node: Node | null): boolean => {
  if (!node) {
    return false;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    return isWithinAutoLocalizeScope(node);
  }

  if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_NODE) {
    return false;
  }

  const element = node.nodeType === Node.DOCUMENT_NODE ? (node as Document).documentElement : (node as Element);
  if (!element) {
    return false;
  }

  if (element.matches?.(AUTO_LOCALIZE_ROOT_SELECTOR)) {
    return true;
  }

  if (element.closest?.(AUTO_LOCALIZE_ROOT_SELECTOR)) {
    return true;
  }

  if (element.querySelector?.(AUTO_LOCALIZE_ROOT_SELECTOR)) {
    return true;
  }

  return false;
};

const buildDictionary = (activeLanguage: string): Map<string, string> => {
  const dictionary = new Map<string, string>();

  if (activeLanguage === "tr") {
    return dictionary;
  }

  const trResources = i18n.getDataByLanguage("tr") || {};
  const targetResources = i18n.getDataByLanguage(activeLanguage) || i18n.getDataByLanguage("en") || {};

  const namespaces = new Set([...Object.keys(trResources), ...Object.keys(targetResources)]);

  const sourceToTargets = new Map<string, Set<string>>();

  namespaces.forEach((namespaceName) => {
    const trValuesByKey = flattenLeafValuesByKey(trResources[namespaceName] as Record<string, unknown>);
    const targetValuesByKey = flattenLeafValuesByKey(targetResources[namespaceName] as Record<string, unknown>);

    trValuesByKey.forEach((source, key) => {
      const target = targetValuesByKey.get(key);

      if (!source || !target || source === target) {
        return;
      }

      const mappedTargets = sourceToTargets.get(source) || new Set<string>();
      mappedTargets.add(target);
      sourceToTargets.set(source, mappedTargets);
    });
  });

  sourceToTargets.forEach((targets, source) => {
    if (targets.size !== 1) {
      return;
    }

    dictionary.set(source, targets.values().next().value);
  });

  return dictionary;
};

export const useRuntimeAutoLocalization = (): void => {
  const textNodeOriginalsRef = useRef(new WeakMap<Text, string>());
  const elementAttributeOriginalsRef = useRef(new WeakMap<Element, Record<string, string>>());
  const [activeLanguage, setActiveLanguage] = useState(
    extractNormalizedLanguage(i18n.resolvedLanguage || i18n.language || "tr")
  );

  useEffect(() => {
    const handleLanguageChanged = (languageCode: string) => {
      setActiveLanguage(extractNormalizedLanguage(languageCode));
    };

    i18n.on("languageChanged", handleLanguageChanged);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || !document.body) {
      return undefined;
    }
    const dictionary = buildDictionary(activeLanguage);

    const localizeFromOriginal = (originalValue: string): string => {
      if (!originalValue || activeLanguage === "tr") {
        return originalValue;
      }

      const trimmedValue = originalValue.trim();
      const translated = dictionary.get(trimmedValue);

      if (!translated) {
        return originalValue;
      }

      return preserveWhitespaceReplace(originalValue, translated);
    };

    const localizeTextNode = (textNode: Text) => {
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
        return;
      }

      if (!isWithinAutoLocalizeScope(textNode)) {
        return;
      }

      if (isSkippableContainer(textNode)) {
        return;
      }

      const existingOriginal = textNodeOriginalsRef.current.get(textNode);
      const originalValue = existingOriginal ?? textNode.nodeValue ?? "";

      if (!existingOriginal) {
        textNodeOriginalsRef.current.set(textNode, originalValue);
      }

      const localizedValue = localizeFromOriginal(originalValue);
      if (localizedValue !== textNode.nodeValue) {
        textNode.nodeValue = localizedValue;
      }
    };

    const localizeElementAttributes = (element: Element) => {
      if (!element || element.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      if (!isWithinAutoLocalizeScope(element)) {
        return;
      }

      if (isSkippableContainer(element)) {
        return;
      }

      const storedOriginals = elementAttributeOriginalsRef.current.get(element) || {};

      ATTRIBUTES_TO_LOCALIZE.forEach((attributeName) => {
        const currentValue = element.getAttribute(attributeName);
        if (currentValue === null) {
          return;
        }

        if (storedOriginals[attributeName] === undefined) {
          storedOriginals[attributeName] = currentValue;
        }

        const localizedValue = localizeFromOriginal(storedOriginals[attributeName]);
        if (localizedValue !== currentValue) {
          element.setAttribute(attributeName, localizedValue);
        }
      });

      elementAttributeOriginalsRef.current.set(element, storedOriginals);
    };

    const localizeSubtree = (rootNode: Node) => {
      if (!rootNode) {
        return;
      }

      if (!isAutoLocalizeCandidate(rootNode)) {
        return;
      }

      if (rootNode.nodeType === Node.TEXT_NODE) {
        localizeTextNode(rootNode as Text);
        return;
      }

      if (rootNode.nodeType !== Node.ELEMENT_NODE && rootNode.nodeType !== Node.DOCUMENT_NODE) {
        return;
      }

      const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);

      let currentNode: Node | null = walker.currentNode;
      while (currentNode) {
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
          localizeElementAttributes(currentNode as Element);
        } else if (currentNode.nodeType === Node.TEXT_NODE) {
          localizeTextNode(currentNode as Text);
        }

        currentNode = walker.nextNode();
      }
    };

    const roots = Array.from(document.querySelectorAll(AUTO_LOCALIZE_ROOT_SELECTOR));
    roots.forEach((rootElement) => {
      localizeSubtree(rootElement);
    });

    const pendingNodes = new Set<Node>();
    let animationFrameId: number | null = null;

    const flushPendingNodes = () => {
      animationFrameId = null;
      const nodes = Array.from(pendingNodes);
      pendingNodes.clear();

      nodes.forEach((node) => {
        localizeSubtree(node);
      });
    };

    const queueNode = (node: Node | null) => {
      if (!node) {
        return;
      }

      pendingNodes.add(node);

      if (animationFrameId === null) {
        animationFrameId = window.requestAnimationFrame(flushPendingNodes);
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") {
          if (!isWithinAutoLocalizeScope(mutation.target)) {
            return;
          }

          queueNode(mutation.target);
          return;
        }

        if (mutation.type === "attributes") {
          queueNode(mutation.target);
          return;
        }

        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            queueNode(node);
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRIBUTES_TO_LOCALIZE,
    });

    return () => {
      observer.disconnect();
      pendingNodes.clear();
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [activeLanguage]);
};

export default useRuntimeAutoLocalization;
