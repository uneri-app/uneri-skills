import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://uneri-app.github.io',
  base: '/uneri-skills',
  integrations: [
    starlight({
      title: 'uneri-skills',
      description: 'Use-case-driven (UDD) and spec-driven (SDD) development, as skills for Claude Code.',
      customCss: ['./src/styles/print.css'],
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
          label: 'Skills',
          items: [
            { label: 'Overview', slug: 'reference/skills' },
            {
              label: 'UDD: use cases',
              items: [
                'reference/skills/udd-init',
                'reference/skills/udd-add',
                'reference/skills/udd-validate',
                'reference/skills/udd-arrange',
                'reference/skills/udd-authoring',
              ],
            },
            {
              label: 'SDD: spec to implementation',
              items: [
                'reference/skills/sdd-init',
                'reference/skills/sdd-requirements',
                'reference/skills/sdd-clarify',
                'reference/skills/sdd-design',
                'reference/skills/sdd-validate-design',
                'reference/skills/sdd-validate-gap',
                'reference/skills/sdd-tasks',
                'reference/skills/sdd-impl',
                'reference/skills/sdd-validate-impl',
                'reference/skills/sdd-trace',
              ],
            },
            {
              label: 'Cross-cutting',
              items: [
                'reference/skills/steering',
                'reference/skills/review',
                'reference/skills/debug',
                'reference/skills/verify-completion',
                'reference/skills/issue-upsert',
                'reference/skills/pr-upsert',
                'reference/skills/adr',
              ],
            },
          ],
        },
        {
          label: 'Reference',
          items: [
            'reference/cheatsheet',
            'reference/use-cases-contract',
            'reference/spec-json-phase',
            'reference/templates',
            'reference/credits',
          ],
        },
        { label: 'Changelog', slug: 'changelog' },
      ],
    }),
  ],
});
