import { useEffect, useRef, useState } from 'react';
import i18n from '../i18n';

const ATTRIBUTES_TO_LOCALIZE = ['placeholder', 'title', 'aria-label'];
const AUTO_LOCALIZE_ROOT_SELECTOR = '[data-i18n-autolocalize="true"]';
const AUTO_LOCALIZE_EXCLUDE_SELECTOR =
  '[data-i18n-autolocalize="false"], [contenteditable="true"], input, textarea, select, option';

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const flattenLeafValuesByKey = (obj, prefix = '', output = new Map()) => {
  if (!isPlainObject(obj)) {
    return output;
  }

  Object.entries(obj).forEach(([key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (isPlainObject(value)) {
      flattenLeafValuesByKey(value, nextKey, output);
      return;
    }

    if (typeof value === 'string' && value.trim()) {
      output.set(nextKey, value.trim());
    }
  });

  return output;
};

const extractNormalizedLanguage = (languageCode) => {
  if (!languageCode || typeof languageCode !== 'string') {
    return 'tr';
  }

  return languageCode.toLowerCase().split('-')[0];
};

const isSkippableContainer = (node) => {
  const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
  if (!element) {
    return false;
  }

  const tagName = element.tagName;
  if (!tagName) {
    return false;
  }

  return ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA'].includes(tagName);
};

const preserveWhitespaceReplace = (source, replacement) => {
  const leading = source.match(/^\s*/)?.[0] || '';
  const trailing = source.match(/\s*$/)?.[0] || '';
  return `${leading}${replacement}${trailing}`;
};

const getElementForNode = (node) => {
  if (!node) {
    return null;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    return node;
  }

  return node.parentElement || null;
};

const isWithinAutoLocalizeScope = (node) => {
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

const isAutoLocalizeCandidate = (node) => {
  if (!node) {
    return false;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    return isWithinAutoLocalizeScope(node);
  }

  if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_NODE) {
    return false;
  }

  const element = node.nodeType === Node.DOCUMENT_NODE ? node.documentElement : node;
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

const buildDictionary = (activeLanguage) => {
  const dictionary = new Map();

  if (activeLanguage === 'tr') {
    return dictionary;
  }

  const trResources = i18n.getDataByLanguage('tr') || {};
  const targetResources =
    i18n.getDataByLanguage(activeLanguage) ||
    i18n.getDataByLanguage('en') ||
    {};

  const namespaces = new Set([
    ...Object.keys(trResources),
    ...Object.keys(targetResources)
  ]);

  const sourceToTargets = new Map();

  namespaces.forEach((namespaceName) => {
    const trValuesByKey = flattenLeafValuesByKey(trResources[namespaceName]);
    const targetValuesByKey = flattenLeafValuesByKey(targetResources[namespaceName]);

    trValuesByKey.forEach((source, key) => {
      const target = targetValuesByKey.get(key);

      if (!source || !target || source === target) {
        return;
      }

      const mappedTargets = sourceToTargets.get(source) || new Set();
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

export const useRuntimeAutoLocalization = () => {
  const textNodeOriginalsRef = useRef(new WeakMap());
  const elementAttributeOriginalsRef = useRef(new WeakMap());
  const [activeLanguage, setActiveLanguage] = useState(
    extractNormalizedLanguage(i18n.resolvedLanguage || i18n.language || 'tr')
  );

  useEffect(() => {
    const handleLanguageChanged = (languageCode) => {
      setActiveLanguage(extractNormalizedLanguage(languageCode));
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined' || !document.body) {
      return undefined;
    }
    const dictionary = buildDictionary(activeLanguage);

    const localizeFromOriginal = (originalValue) => {
      if (!originalValue || activeLanguage === 'tr') {
        return originalValue;
      }

      const trimmedValue = originalValue.trim();
      const translated = dictionary.get(trimmedValue);

      if (!translated) {
        return originalValue;
      }

      return preserveWhitespaceReplace(originalValue, translated);
    };

    const localizeTextNode = (textNode) => {
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
      const originalValue = existingOriginal ?? textNode.nodeValue ?? '';

      if (!existingOriginal) {
        textNodeOriginalsRef.current.set(textNode, originalValue);
      }

      const localizedValue = localizeFromOriginal(originalValue);
      if (localizedValue !== textNode.nodeValue) {
        textNode.nodeValue = localizedValue;
      }
    };

    const localizeElementAttributes = (element) => {
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

    const localizeSubtree = (rootNode) => {
      if (!rootNode) {
        return;
      }

       if (!isAutoLocalizeCandidate(rootNode)) {
        return;
      }

      if (rootNode.nodeType === Node.TEXT_NODE) {
        localizeTextNode(rootNode);
        return;
      }

      if (rootNode.nodeType !== Node.ELEMENT_NODE && rootNode.nodeType !== Node.DOCUMENT_NODE) {
        return;
      }

      const walker = document.createTreeWalker(
        rootNode,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
      );

      let currentNode = walker.currentNode;
      while (currentNode) {
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
          localizeElementAttributes(currentNode);
        } else if (currentNode.nodeType === Node.TEXT_NODE) {
          localizeTextNode(currentNode);
        }

        currentNode = walker.nextNode();
      }
    };

    const roots = Array.from(document.querySelectorAll(AUTO_LOCALIZE_ROOT_SELECTOR));
    roots.forEach((rootElement) => {
      localizeSubtree(rootElement);
    });

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData') {
          if (!isWithinAutoLocalizeScope(mutation.target)) {
            return;
          }

          localizeTextNode(mutation.target);
          return;
        }

        if (mutation.type === 'attributes') {
          localizeElementAttributes(mutation.target);
          return;
        }

        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            localizeSubtree(node);
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRIBUTES_TO_LOCALIZE
    });

    return () => {
      observer.disconnect();
    };
  }, [activeLanguage]);
};

export default useRuntimeAutoLocalization;

