import { describe, expect, it } from 'vitest';
import {
  ASSISTANT_FAQ_ITEMS,
  findAssistantFaqItem,
  getAssistantFaqAnswer,
  normalizeAssistantFaqText,
} from './assistantFaqService';

const translations = {
  'assistant.questions.q1': 'Namaz nasıl kılınır?',
  'assistant.questions.q2': 'Orucu bozan şeyler nelerdir?',
  'assistant.questions.q3': 'Zekat kimlere verilir?',
  'assistant.questions.q4': 'Abdest nasıl alınır?',
  'assistant.questions.q5': 'Kur\'an okumanın fazileti nedir?',
  'assistant.questions.q6': 'Peygamberimizin hayatı kısaca nasıldır?',
  'assistant.questions.q7': 'Gusül abdesti nasıl alınır?',
  'assistant.questions.q8': 'Teheccüd namazı nasıldır?',
  'assistant.questions.q9': 'Kaza namazı nasıl kılınır?',
  'assistant.questions.q10': 'Sehiv secdesi nedir?',
  'assistant.questions.q11': 'Sadakanın faziletleri nelerdir?',
  'assistant.questions.q12': 'Fitre nedir, kimlere verilir?',
  'assistant.questions.q13': 'Seferilik hükümleri nelerdir?',
  'assistant.questions.q14': 'Nafile namazlar nelerdir?',
  'assistant.questions.q15': 'Tövbe nasıl edilir?',
  'assistant.questions.q16': 'Kadir Gecesi ibadetleri nelerdir?',
  'assistant.questions.q17': 'Hac kimlere farzdır?',
  'assistant.questions.q18': 'Kurban ibadeti şartları nelerdir?',
  'assistant.questions.q19': 'Duanın adabı nelerdir?',
  'assistant.questions.q20': 'Hadis ve sünnet farkı nedir?',
  'assistant.questions.q21': 'Esma-i Hüsna faziletleri nelerdir?',
  'assistant.questions.q22': 'Kul hakkı nasıl ödenir?',
  'assistant.questions.q23': 'Cemaatle namaz fazileti nedir?',
  'assistant.questions.q24': 'Salavat getirmek nedir?',
  'assistant.questions.q25': 'Kandil geceleri ibadetleri nelerdir?',
  'assistant.betaUnknownQuestion': 'Bilinmeyen soru',
};

const t = (key, fallback) => translations[key] ?? fallback ?? key;

describe('assistantFaqService', () => {
  it('keeps preset question and answer keys paired', () => {
    expect(ASSISTANT_FAQ_ITEMS).toHaveLength(25);
    ASSISTANT_FAQ_ITEMS.forEach((item) => {
      expect(item.key).toMatch(/^assistant\.questions\.q\d+$/);
      expect(item.answer).toBeTruthy();
    });
  });

  it('normalizes Turkish text safely', () => {
    expect(normalizeAssistantFaqText('  Orucu bozan şeyler nelerdir? ')).toBe('orucu bozan seyler nelerdir');
  });

  it('matches an exact preset question', () => {
    const item = findAssistantFaqItem('Orucu bozan şeyler nelerdir?', t);
    expect(item?.key).toBe('assistant.questions.q2');
  });

  it('matches a longer but equivalent user query', () => {
    const item = findAssistantFaqItem('Orucu bozan şeyler nelerdir acaba', t);
    expect(item?.key).toBe('assistant.questions.q2');
  });

  it('returns the paired answer for a preset question', () => {
    expect(getAssistantFaqAnswer('Orucu bozan şeyler nelerdir?', t)).toContain('orucu bozar');
  });

  it('matches smart keyword overlaps (stemming)', () => {
    // "namazı" matches "namaz", "kılmak" matches "kılınır"
    const item = findAssistantFaqItem('namazı nasıl kılacağız', t);
    expect(item?.key).toBe('assistant.questions.q1');
  });
});
