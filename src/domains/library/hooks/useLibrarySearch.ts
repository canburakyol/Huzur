import { useDeferredValue, useMemo, useState } from 'react';

interface LibraryItem {
  id?: string;
  title?: string;
  icon?: string;
  isPro?: boolean;
  type?: string;
  chapters?: Array<{ title: string; content: string }>;
  items?: Array<Record<string, string>>;
  topics?: Array<Record<string, string>>;
  questions?: Array<{ q: string; a: string }>;
  duration?: string;
}

interface LibraryCategory {
  id: string;
  title: string;
  icon: string;
  isPro?: boolean;
  data: LibraryItem[];
}

interface SearchResult {
  type: string;
  category?: string;
  icon?: string;
  item?: LibraryItem;
  parentCategoryId: string;
  requiresPro: boolean;
  match?: string;
}

const normalize = (value: unknown): string => String(value || '').toLocaleLowerCase('tr-TR');

const includesQuery = (value: unknown, query: string): boolean => normalize(value).includes(query);

const joinText = (...values: Array<string | undefined>): string => values.filter(Boolean).join(' ');

export function useLibrarySearch(categories: LibraryCategory[]) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const categoryMap = useMemo(() => {
    return categories.reduce((accumulator: Record<string, LibraryCategory>, category) => {
      accumulator[category.id] = category;
      return accumulator;
    }, {});
  }, [categories]);

  const results = useMemo(() => {
    const normalizedQuery = normalize(deferredQuery).trim();

    if (!normalizedQuery || normalizedQuery.length < 2) {
      return [];
    }

    const matches: SearchResult[] = [];

    const pushResult = (result: SearchResult) => {
      if (matches.length < 20) {
        matches.push(result);
      }
    };

    const pushMatch = (categoryId: string, item: LibraryItem | undefined, result: Partial<SearchResult>) => {
      const category = categoryMap[categoryId];

      if (!category) {
        return;
      }

      pushResult({
        ...result,
        category: result.category || category.title,
        icon: result.icon || item?.icon || category.icon,
        item,
        parentCategoryId: categoryId,
        requiresPro: Boolean(result.requiresPro || item?.isPro || category.isPro)
      } as SearchResult);
    };

    (categoryMap.books?.data || []).forEach((book) => {
      if (includesQuery(book.title, normalizedQuery)) {
        pushMatch('books', book, { type: 'book' });
      }

      book.chapters?.forEach((chapter) => {
        if (includesQuery(joinText(chapter.title, chapter.content), normalizedQuery)) {
          pushMatch('books', book, {
            type: 'chapter',
            category: book.title,
            match: chapter.title
          });
        }
      });
    });

    (categoryMap.texts?.data || []).forEach((text) => {
      if (includesQuery(text.title, normalizedQuery)) {
        pushMatch('texts', text, { type: 'text' });
      }

      text.items?.forEach((item) => {
        if (includesQuery(joinText(item.title, item.name, item.text, item.explanation), normalizedQuery)) {
          pushMatch('texts', text, {
            type: 'text-item',
            category: text.title,
            match: item.title || item.name || item.text
          });
        }
      });
    });

    (categoryMap.education?.data || []).forEach((educationItem) => {
      if (includesQuery(educationItem.title, normalizedQuery)) {
        pushMatch('education', educationItem, { type: 'education' });
      }

      educationItem.topics?.forEach((topic) => {
        if (includesQuery(joinText(topic.title, topic.name, topic.content, topic.description, topic.pronunciation), normalizedQuery)) {
          pushMatch('education', educationItem, {
            type: 'topic',
            category: educationItem.title,
            match: topic.title || topic.name
          });
        }
      });
    });

    (categoryMap.references?.data || []).forEach((reference) => {
      if (includesQuery(reference.title, normalizedQuery)) {
        pushMatch('references', reference, { type: 'reference' });
      }

      reference.items?.forEach((item) => {
        if (includesQuery(joinText(item.name, item.meaning, item.title, item.description, item.text), normalizedQuery)) {
          pushMatch('references', reference, {
            type: 'reference-item',
            category: reference.title,
            match: item.name || item.title
          });
        }
      });
    });

    (categoryMap.prayers?.data || []).forEach((prayer) => {
      if (includesQuery(joinText(prayer.title, prayer.meaning, prayer.situation, prayer.transliteration, prayer.turkish, prayer.source), normalizedQuery)) {
        pushMatch('prayers', prayer, {
          type: 'prayer',
          category: categoryMap.prayers?.title,
          match: prayer.turkish || prayer.meaning || prayer.title
        });
      }
    });

    (categoryMap.audio?.data || []).forEach((audioItem) => {
      if (includesQuery(audioItem.title, normalizedQuery)) {
        pushMatch('audio', audioItem, { type: 'audio' });
      }

      audioItem.items?.forEach((track) => {
        if (includesQuery(joinText(track.title, track.duration), normalizedQuery)) {
          pushMatch('audio', audioItem, {
            type: 'track',
            category: audioItem.title,
            match: track.title
          });
        }
      });
    });

    (categoryMap.video?.data || []).forEach((videoItem) => {
      if (includesQuery(joinText(videoItem.title, videoItem.description, videoItem.source), normalizedQuery)) {
        pushMatch('video', videoItem, {
          type: 'video',
          requiresPro: videoItem.isPro
        });
      }

      videoItem.topics?.forEach((topic) => {
        if (includesQuery(topic as string, normalizedQuery)) {
          pushMatch('video', videoItem, {
            type: 'video-topic',
            category: videoItem.title,
            match: topic as string,
            requiresPro: videoItem.isPro
          });
        }
      });
    });

    (categoryMap.faq?.data || []).forEach((faq) => {
      if (includesQuery(faq.category, normalizedQuery)) {
        pushMatch('faq', faq, { type: 'faq' });
      }

      faq.questions?.forEach((question) => {
        if (includesQuery(joinText(question.q, question.a), normalizedQuery)) {
          pushMatch('faq', faq, {
            type: 'question',
            category: faq.category,
            match: question.q
          });
        }
      });
    });

    return matches;
  }, [categoryMap, deferredQuery]);

  const clearQuery = () => {
    setQuery('');
  };

  return {
    clearQuery,
    query,
    results,
    setQuery
  };
}

export default useLibrarySearch;
