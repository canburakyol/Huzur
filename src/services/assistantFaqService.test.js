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
  'assistant.questions.q5': 'Kuran okumanın fazileti',
  'assistant.questions.q6': 'Peygamberimizin hayatı',
  'assistant.betaUnknownQuestion': 'Bilinmeyen soru',
};

const t = (key, fallback) => translations[key] ?? fallback ?? key;

describe('assistantFaqService', () => {
  it('keeps preset question and answer keys paired', () => {
    expect(ASSISTANT_FAQ_ITEMS).toHaveLength(6);
    ASSISTANT_FAQ_ITEMS.forEach((item) => {
      expect(item.key).toMatch(/^assistant\.questions\.q\d$/);
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

  it('returns the unknown-question fallback when there is no safe match', () => {
    expect(getAssistantFaqAnswer('Sabah namazı kaç rekattır?', t)).toBe('Bilinmeyen soru');
  });
});
