import { useCallback, useMemo, useState } from 'react';

interface Breadcrumb {
  id: string;
  label: string;
}

interface LibraryItem {
  id?: string;
  title?: string;
  type?: string;
  category?: string;
}

interface Reciter {
  id: string;
  name: string;
}

interface Category {
  id: string;
  title: string;
}

type CurrentView = 'categories' | 'category' | 'item' | 'reciter';

const ROOT_BREADCRUMB: Breadcrumb = { id: 'root', label: 'Kütüphane' };

export function useLibraryNavigation() {
  const [currentView, setCurrentView] = useState<CurrentView>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const breadcrumbs = useMemo(() => {
    const trail: Breadcrumb[] = [ROOT_BREADCRUMB];

    if (selectedCategory) {
      trail.push({
        id: selectedCategory.id,
        label: selectedCategory.title
      });
    }

    if (selectedItem) {
      trail.push({
        id: selectedItem.id || selectedItem.title || 'item',
        label: selectedItem.title || selectedItem.category || 'Detay'
      });
    }

    if (selectedReciter) {
      trail.push({
        id: selectedReciter.id,
        label: selectedReciter.name
      });
    }

    return trail;
  }, [selectedCategory, selectedItem, selectedReciter]);

  const selectCategory = useCallback((category: Category) => {
    setSelectedCategory(category);
    setSelectedItem(null);
    setSelectedReciter(null);
    setExpandedSection(null);
    setCurrentView('category');
  }, []);

  const selectItem = useCallback((item: LibraryItem) => {
    setSelectedItem(item);
    setSelectedReciter(null);
    setExpandedSection(null);
    setCurrentView(item?.type === 'reciters' ? 'reciter' : 'item');
  }, []);

  const selectReciter = useCallback((reciter: Reciter) => {
    setSelectedReciter(reciter);
    setExpandedSection(null);
    setCurrentView('reciter');
  }, []);

  const toggleExpandedSection = useCallback((index: number) => {
    setExpandedSection((current) => (current === index ? null : index));
  }, []);

  const clearExpandedSection = useCallback(() => {
    setExpandedSection(null);
  }, []);

  const resetNavigation = useCallback(() => {
    setCurrentView('categories');
    setSelectedCategory(null);
    setSelectedItem(null);
    setSelectedReciter(null);
    setExpandedSection(null);
  }, []);

  const goBack = useCallback(() => {
    if (selectedReciter) {
      setSelectedReciter(null);
      setExpandedSection(null);
      setCurrentView('reciter');
      return 'reciter';
    }

    if (selectedItem) {
      setSelectedItem(null);
      setExpandedSection(null);
      setCurrentView(selectedCategory ? 'category' : 'categories');
      return 'item';
    }

    if (selectedCategory) {
      setSelectedCategory(null);
      setExpandedSection(null);
      setCurrentView('categories');
      return 'category';
    }

    return 'root';
  }, [selectedCategory, selectedItem, selectedReciter]);

  return {
    breadcrumbs,
    clearExpandedSection,
    currentView,
    expandedSection,
    goBack,
    resetNavigation,
    selectCategory,
    selectItem,
    selectReciter,
    selectedCategory,
    selectedItem,
    selectedReciter,
    toggleExpandedSection
  };
}

export default useLibraryNavigation;
