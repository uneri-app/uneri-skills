import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://uneri-app.github.io',
  base: '/uneri-skills',
  integrations: [
    starlight({
      title: 'uneri-skills',
      description: 'Use-case-driven (UDD) and spec-driven (SDD) development, as skills for Claude Code.',
      defaultLocale: 'root',
      locales: { root: { label: 'English', lang: 'en' } },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/uneri-app/uneri-skills' },
      ],
      sidebar: [
        {
          label: 'Getting started',
          items: [{ autogenerate: { directory: 'getting-started' } }],
        },
        {
          label: 'Concepts',
          items: [{ autogenerate: { directory: 'concepts' } }],
        },
        {
          label: 'Guides',
          items: [{ autogenerate: { directory: 'guides' } }],
        },
        {
          label: 'Reference',
          items: [{ autogenerate: { directory: 'reference' } }],
        },
        { label: 'Changelog', slug: 'changelog' },
      ],
    }),
  ],
});
