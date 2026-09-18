import type { SchoolLandingData } from './types';

/**
 * Placeholder content only - every field here is meant to be swapped for
 * real data (school profile, theme, notices/events content modules) once
 * this page is wired to the backend. Nothing downstream of this object
 * (any component in this folder) should need to change when that happens -
 * they all just take a `SchoolLandingData` shaped prop.
 *
 * `loginUrl` is a relative path (`/login`), unlike the copy of this file in
 * public-site: this is the platform's own landing page inside the merged
 * app, so Login is just an in-app route, not a cross-app link.
 */
export const defaultSchoolLandingData: SchoolLandingData = {
  schoolName: 'School SaaS',
  logoUrl: null,
  loginUrl: '/login',
  nav: [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Academics', href: '#academics' },
    { label: 'Admissions', href: '#admissions' },
    { label: 'Events', href: '#events' },
    { label: 'Contact', href: '#contact' },
  ],
  hero: {
    tagline: 'Inspiring Excellence, Building the Future.',
    description: 'A modern learning environment where students discover, learn and grow.',
    backgroundImageUrl: null,
    primaryCta: { label: 'Explore Our School', href: '#about' },
    secondaryCta: { label: 'Admissions', href: '#admissions' },
  },
  about: {
    heading: 'A place where every student thrives',
    body: 'For over two decades, we have combined a rigorous academic curriculum with a supportive, values-driven community - helping every student discover their strengths and pursue them with confidence.',
    imageUrl: null,
    ctaLabel: 'Learn More',
    ctaHref: '#about',
  },
  highlights: [
    { value: '25+', label: 'Years of Excellence' },
    { value: '500+', label: 'Students' },
    { value: '40+', label: 'Teachers' },
    { value: '15+', label: 'Programs' },
  ],
  events: [
    { title: 'Annual Sports Day', date: 'October 10, 2026', description: 'A full day of track and field events for every grade.' },
    { title: 'Science Exhibition', date: 'November 4, 2026', description: 'Student-led projects showcasing hands-on scientific inquiry.' },
    { title: "Parents' Day", date: 'December 2, 2026', description: 'An open house for families to meet teachers and explore classrooms.' },
  ],
  cta: {
    heading: 'Ready to Begin Your Journey?',
    body: 'Discover what makes our school special - schedule a visit or start your application today.',
    buttonLabel: 'Explore Admissions',
    buttonHref: '#admissions',
  },
  footer: {
    description: 'A modern learning environment where students discover, learn and grow, together.',
    quickLinks: [
      { label: 'About', href: '#about' },
      { label: 'Academics', href: '#academics' },
      { label: 'Admissions', href: '#admissions' },
      { label: 'Events', href: '#events' },
    ],
    contact: {
      address: '123 Learning Lane, Springfield',
      phone: '+1 (555) 012-3456',
      email: 'info@abcschool.edu',
    },
    social: [
      { label: 'Facebook', href: '#' },
      { label: 'Twitter', href: '#' },
      { label: 'Instagram', href: '#' },
      { label: 'Youtube', href: '#' },
    ],
  },
};
