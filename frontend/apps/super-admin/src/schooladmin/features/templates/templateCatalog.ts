export type TemplateCategory = 'All' | 'Modern' | 'Classic' | 'Bold' | 'Minimal';

export type Template = {
  id: string;
  name: string;
  category: Exclude<TemplateCategory, 'All'>;
  description: string;
  accent: string;
  accentSoft: string;
  dark: string;
  font: string;
  sections: string[];
  layout: 'editorial' | 'classic' | 'playful' | 'minimal' | 'heritage' | 'stem';
  badge?: string;
};

export const templates: Template[] = [
  {
    id: 'horizon', name: 'Editorial homepage', category: 'Modern',
    description: 'A confident hero, programme highlights and school stories.',
    accent: '#2563eb', accentSoft: '#dbeafe', dark: '#102a43', font: 'Inter',
    sections: ['Hero', 'Trust bar', 'Programs', 'Campus story', 'News', 'Footer'], layout: 'editorial', badge: 'Popular',
  },
  {
    id: 'scholars', name: 'Welcome & admissions', category: 'Classic',
    description: 'A warm opening layout focused on community and admissions.',
    accent: '#9a3412', accentSoft: '#ffedd5', dark: '#3b1b13', font: 'DM Serif Display',
    sections: ['Hero', 'Welcome', 'Academics', 'Principal message', 'Events', 'Footer'], layout: 'classic',
  },
  {
    id: 'spark', name: 'Student life showcase', category: 'Bold',
    description: 'Bright, lively blocks for campus life, clubs and galleries.',
    accent: '#7c3aed', accentSoft: '#ede9fe', dark: '#24113f', font: 'Manrope',
    sections: ['Hero', 'Quick links', 'Learning paths', 'Gallery', 'Testimonials', 'Footer'], layout: 'playful', badge: 'New',
  },
  {
    id: 'northstar', name: 'Minimal school story', category: 'Minimal',
    description: 'A calm, premium canvas that puts your school content first.',
    accent: '#0f766e', accentSoft: '#ccfbf1', dark: '#0f2f2c', font: 'Plus Jakarta Sans',
    sections: ['Hero', 'Stats', 'Programs', 'Faculty', 'Journal', 'Footer'], layout: 'minimal',
  },
  {
    id: 'heritage', name: 'School community', category: 'Classic',
    description: 'Timeless typography for values, people and school culture.',
    accent: '#a16207', accentSoft: '#fef3c7', dark: '#3b2a12', font: 'Libre Baskerville',
    sections: ['Hero', 'Admissions', 'Values', 'Campus', 'Community', 'Footer'], layout: 'heritage',
  },
  {
    id: 'summit', name: 'Future learning', category: 'Modern',
    description: 'A sharp programme layout for outcomes, labs and projects.',
    accent: '#0369a1', accentSoft: '#e0f2fe', dark: '#0c2740', font: 'Space Grotesk',
    sections: ['Hero', 'Outcomes', 'Labs', 'Projects', 'CTA', 'Footer'], layout: 'stem',
  },
];

export function getTemplate(id: string | undefined) {
  return templates.find((template) => template.id === id) ?? templates[0];
}
