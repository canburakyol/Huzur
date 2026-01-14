import fs from 'fs';
import { BOOKS, RELIGIOUS_TEXTS, EDUCATION, REFERENCES, FAQ, LIBRARY_CATEGORIES } from './src/data/libraryData.js';

const translations = {};
const slugify = (text) => {
    if (!text) return '';
    return text.toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
};

const processBooks = () => {
    return BOOKS.map(book => {
        const bookKey = `library.books.${book.id}`;
        translations[`${bookKey}.title`] = book.title;
        translations[`${bookKey}.description`] = book.description;
        
        const newChapters = book.chapters.map((chap, idx) => {
            const chapKey = `${bookKey}.chapters.${idx}`;
            translations[`${chapKey}.title`] = chap.title;
            translations[`${chapKey}.content`] = chap.content;
            return { ...chap, title: `${chapKey}.title`, content: `${chapKey}.content` };
        });
        return { ...book, title: `${bookKey}.title`, description: `${bookKey}.description`, chapters: newChapters };
    });
};

const processTexts = () => {
    return RELIGIOUS_TEXTS.map(text => {
        const textKey = `library.texts.${text.id}`;
        translations[`${textKey}.title`] = text.title;
        translations[`${textKey}.description`] = text.description;
        
        const newItems = text.items.map((item, idx) => {
            const itemKey = `${textKey}.items.${idx}`;
            if (item.title) translations[`${itemKey}.title`] = item.title;
            if (item.text) translations[`${itemKey}.text`] = item.text;
            if (item.explanation) translations[`${itemKey}.explanation`] = item.explanation;
            
            const newItem = { ...item };
            if (item.title) newItem.title = `${itemKey}.title`;
            if (item.text) newItem.text = `${itemKey}.text`;
            if (item.explanation) newItem.explanation = `${itemKey}.explanation`;
            return newItem;
        });
        return { ...text, title: `${textKey}.title`, description: `${textKey}.description`, items: newItems };
    });
};

const processEdu = () => {
    return EDUCATION.map(edu => {
        const eduKey = `library.education.${edu.id}`;
        translations[`${eduKey}.title`] = edu.title;
        translations[`${eduKey}.description`] = edu.description;
        
        const newTopics = edu.topics.map((topic, idx) => {
            const topicKey = `${eduKey}.topics.${idx}`;
            if (topic.title) translations[`${topicKey}.title`] = topic.title;
            if (topic.content) translations[`${topicKey}.content`] = topic.content;
            if (topic.description) translations[`${topicKey}.description`] = topic.description;
            if (topic.name) translations[`${topicKey}.name`] = topic.name;
            
            const newTopic = { ...topic };
            if (topic.title) newTopic.title = `${topicKey}.title`;
            if (topic.content) newTopic.content = `${topicKey}.content`;
            if (topic.description) newTopic.description = `${topicKey}.description`;
            if (topic.name) newTopic.name = `${topicKey}.name`;
            return newTopic;
        });
        return { ...edu, title: `${eduKey}.title`, description: `${eduKey}.description`, topics: newTopics };
    });
};

const processRefs = () => {
    return REFERENCES.map(ref => {
        const refKey = `library.references.${ref.id}`;
        translations[`${refKey}.title`] = ref.title;
        translations[`${refKey}.description`] = ref.description;
        
        const newItems = ref.items.map((item, idx) => {
            const itemKey = `${refKey}.items.${idx}`;
            if (item.name) translations[`${itemKey}.name`] = item.name;
            if (item.meaning) translations[`${itemKey}.meaning`] = item.meaning;
            if (item.title) translations[`${itemKey}.title`] = item.title;
            if (item.description) translations[`${itemKey}.description`] = item.description;
            
            const newItem = { ...item };
            if (item.name) newItem.name = `${itemKey}.name`;
            if (item.meaning) newItem.meaning = `${itemKey}.meaning`;
            if (item.title) newItem.title = `${itemKey}.title`;
            if (item.description) newItem.description = `${itemKey}.description`;
            return newItem;
        });
        return { ...ref, title: `${refKey}.title`, description: `${refKey}.description`, items: newItems };
    });
};

const processFAQ = () => {
    return FAQ.map(faq => {
        const faqKey = `library.faq.${faq.id}`;
        translations[`${faqKey}.category`] = faq.category;
        
        const newQuestions = faq.questions.map((q, idx) => {
            const qKey = `${faqKey}.questions.${idx}`;
            translations[`${qKey}.q`] = q.q;
            translations[`${qKey}.a`] = q.a;
            return { ...q, q: `${qKey}.q`, a: `${qKey}.a` };
        });
        return { ...faq, category: `${faqKey}.category`, questions: newQuestions };
    });
};

const newBooks = processBooks();
const newTexts = processTexts();
const newEdu = processEdu();
const newRefs = processRefs();
const newFAQ = processFAQ();

const newCategories = LIBRARY_CATEGORIES.map(cat => {
    const catKey = `library.categories.${cat.id}`;
    translations[`${catKey}.title`] = cat.title;
    return { ...cat, title: `${catKey}.title` };
    // Note: 'data' field in categories refers to the variables, we need to handle that in string generation
});

// Generate file content
const generateContent = () => {
    return `// Library Data - Kütüphane İçerikleri
// Comprehensive Islamic Library Content

// ==================== 1. KİTAPLAR ====================
export const BOOKS = ${JSON.stringify(newBooks, null, 4)};

// ==================== 2. DİNİ METİNLER ====================
export const RELIGIOUS_TEXTS = ${JSON.stringify(newTexts, null, 4)};

// ==================== 3. EĞİTİM İÇERİKLERİ ====================
export const EDUCATION = ${JSON.stringify(newEdu, null, 4)};

// ==================== 4. REFERANSLAR ====================
export const REFERENCES = ${JSON.stringify(newRefs, null, 4)};

// ==================== 5. SORU-CEVAP ====================
export const FAQ = ${JSON.stringify(newFAQ, null, 4)};

// Tüm kategoriler
export const LIBRARY_CATEGORIES = [
    { id: 'books', title: 'library.categories.books.title', icon: '📚', data: BOOKS },
    { id: 'texts', title: 'library.categories.texts.title', icon: '📜', data: RELIGIOUS_TEXTS },
    { id: 'education', title: 'library.categories.education.title', icon: '🎓', data: EDUCATION },
    { id: 'references', title: 'library.categories.references.title', icon: '📋', data: REFERENCES },
    { id: 'faq', title: 'library.categories.faq.title', icon: '❓', data: FAQ }
];
`;
};

fs.writeFileSync('src/data/libraryData.js', generateContent());
fs.writeFileSync('library_keys.json', JSON.stringify(translations, null, 2));

console.log('Done');
