import configData from '@/data/game.config.json';
import differencesData from '@/data/differences.json';
import doorsWindowsData from '@/data/doors-windows.json';
import demoWalkthroughData from '@/data/demo-walkthrough.json';
import faqData from '@/data/faq.json';

// ─── Interfaces ───────────────────────────────────────────────

export interface GameConfig {
  game: {
    name: string;
    steamAppId: string;
    demoAppId: string;
    developer: string;
    publisher: string;
    genre: string;
    releaseDate: string;
    currentVersion: string;
    lastUpdated: string;
    platforms: string[];
    price: string;
    rating: string;
    itchUrl: string;
    description: string;
    tags: string[];
  };
  stats: {
    demoAvailable: boolean;
    releaseDate: string;
    platform: string;
    genre: string;
    status: string;
    developer: string;
  };
  seo: {
    siteTitle: string;
    siteDescription: string;
    baseUrl: string;
    primaryKeywords: string[];
    secondaryKeywords: string[];
    defaultOgImage: string;
  };
  routes: { path: string; title: string; priority: string }[];
}

export interface Difference {
  id: string;
  room: string;
  objectCategory: string;
  objectName: string;
  changeType: 'moved' | 'missing' | 'opened' | 'damaged' | 'new';
  description: string;
  spoilerLevel: 'light' | 'full';
  verified: 'demo' | 'unconfirmed' | 'may-vary';
  notes: string;
}

export interface DoorWindow {
  id: string;
  name: string;
  location: string;
  currentState: string;
  safeAction: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  verified: 'demo' | 'unconfirmed';
  notes: string;
}

export interface WalkthroughStep {
  id: string;
  stage: number;
  title: string;
  spoilerLight: string;
  fullSpoiler: string;
  tips: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

// ─── Data Access ──────────────────────────────────────────────

const config: GameConfig = configData as GameConfig;
const differences: Difference[] = (differencesData as { differences: Difference[] }).differences;
const doorsWindows: DoorWindow[] = (doorsWindowsData as { doorsWindows: DoorWindow[] }).doorsWindows;
const walkthrough: WalkthroughStep[] = (demoWalkthroughData as { walkthrough: WalkthroughStep[] }).walkthrough;
const faqs: FaqItem[] = (faqData as { faqs: FaqItem[] }).faqs;

export const getGameConfig = () => config;
export const getDifferences = () => differences;
export const getDoorsWindows = () => doorsWindows;
export const getDemoWalkthrough = () => walkthrough;
export const getFaqs = () => faqs;

// ─── Helpers ──────────────────────────────────────────────────

export function getCurrentDateString() {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// ─── SEO Schema Generators ────────────────────────────────────

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  const baseUrl = config.seo.baseUrl;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

export function generateFAQSchema(questions: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

export function generateVideoGameSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: config.game.name,
    description: config.seo.siteDescription,
    genre: config.game.genre,
    url: `https://store.steampowered.com/app/${config.game.steamAppId}/`,
    operatingSystem: config.game.platforms.join(', '),
    author: {
      '@type': 'Organization',
      name: config.game.developer,
    },
    applicationCategory: 'Game',
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/PreOrder',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

export function generateArticleSchema(title: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    url: `${config.seo.baseUrl}${url}`,
    author: {
      '@type': 'Organization',
      name: `${config.game.name} Guide`,
    },
    publisher: {
      '@type': 'Organization',
      name: `${config.game.name} Guide`,
    },
    datePublished: config.game.lastUpdated,
    dateModified: config.game.lastUpdated,
    mainEntityOfPage: `${config.seo.baseUrl}${url}`,
  };
}

export function generateSoftwareApplicationSchema(name: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: name,
    description: description,
    url: `${config.seo.baseUrl}${url}`,
    applicationCategory: 'Game',
    operatingSystem: config.game.platforms.join(', '),
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/PreOrder',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}
