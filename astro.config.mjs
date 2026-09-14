import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
  site: 'https://taxodiumpendragon.github.io',
  trailingSlash: 'always',
  markdown: { processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] }) },
  integrations: [
    starlight({
      title: 'TaxodiumPendragon',
      description: '课程笔记与论文阅读：在学习与研究中，留下理解的轨迹。',
      defaultLocale: 'root',
      locales: { root: { label: '简体中文', lang: 'zh-CN' } },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/TaxodiumPendragon' }],
      customCss: ['katex/dist/katex.min.css', './src/styles/custom.css'],
      components: { PageTitle: './src/components/PageTitle.astro' },
      sidebar: [
        { label: '首页', link: '/' },
        { label: '课程笔记', items: [
          { label: '课程总览', link: '/courses/' },
          { label: '编译原理', items: [{ autogenerate: { directory: 'courses/compilers' } }] },
          { label: '软件工程', items: [{ autogenerate: { directory: 'courses/software-engineering' } }] },
          { label: '计算机体系结构', items: [{ label: '缓存层次与命中率（示例）', link: '/courses/example-cache-hierarchy/' }] },
        ] },
        { label: '论文阅读', items: [{ autogenerate: { directory: 'papers' } }] },
        { label: '关于作者', link: '/about/' },
      ],
    }),
  ],
});
