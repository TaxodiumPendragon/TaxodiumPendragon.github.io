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
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      defaultLocale: 'root',
      locales: { root: { label: '简体中文', lang: 'zh-CN' } },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/TaxodiumPendragon' }],
      customCss: ['katex/dist/katex.min.css', './src/styles/custom.css'],
      components: { PageTitle: './src/components/PageTitle.astro' },
      sidebar: [
        { label: '首页', link: '/' },
        { label: '课程笔记', collapsed: true, items: [
          { label: '课程总览', link: '/courses/' },
          { label: '编译原理', collapsed: true, items: [{ autogenerate: { directory: 'courses/compilers' } }] },
          { label: '软件工程', collapsed: true, items: [{ autogenerate: { directory: 'courses/software-engineering' } }] },
          { label: '数据结构与算法', collapsed: true, items: [
            { label: '课程总览', link: '/courses/data-structures-and-algorithms/' },
            { label: '复习与总结', collapsed: true, items: [{ autogenerate: { directory: 'courses/data-structures-and-algorithms/review' } }] },
            { label: '章节作业', collapsed: true, items: [{ autogenerate: { directory: 'courses/data-structures-and-algorithms/homework' } }] },
            { label: '书面作业答案', collapsed: true, items: [{ autogenerate: { directory: 'courses/data-structures-and-algorithms/written-answers' } }] },
            { label: 'OJ 题解', collapsed: true, items: [{ autogenerate: { directory: 'courses/data-structures-and-algorithms/oj' } }] },
          ] },
          { label: '计算机网络', collapsed: true, items: [
            { label: '课程总览', link: '/courses/computer-networks/' },
            { label: '章节笔记', collapsed: true, items: [{ autogenerate: { directory: 'courses/computer-networks/chapters' } }] },
            { label: '复习与总结', collapsed: true, items: [{ autogenerate: { directory: 'courses/computer-networks/review' } }] },
          ] },
          { label: '离散数学', collapsed: true, items: [
            { label: '课程总览', link: '/courses/discrete-mathematics/' },
            { label: '章节笔记', collapsed: true, items: [{ autogenerate: { directory: 'courses/discrete-mathematics/chapters' } }] },
            { label: '考试与复习', collapsed: true, items: [{ autogenerate: { directory: 'courses/discrete-mathematics/review' } }] },
          ] },
          { label: '计算机组成原理', collapsed: true, items: [
            { label: '课程总览', link: '/courses/computer-organization/' },
            { label: '课堂笔记', collapsed: true, items: [{ autogenerate: { directory: 'courses/computer-organization/lectures' } }] },
            { label: '复习与总结', collapsed: true, items: [{ autogenerate: { directory: 'courses/computer-organization/review' } }] },
          ] },
          { label: '计算机系统导论', collapsed: true, items: [
            { label: '课程总览', link: '/courses/introduction-to-computer-systems/' },
            { label: '章节笔记', collapsed: true, items: [{ autogenerate: { directory: 'courses/introduction-to-computer-systems/chapters' } }] },
            { label: '小班课', collapsed: true, items: [{ autogenerate: { directory: 'courses/introduction-to-computer-systems/tutorials' } }] },
            { label: '课程作业', collapsed: true, items: [{ autogenerate: { directory: 'courses/introduction-to-computer-systems/homework' } }] },
          ] },
          { label: '信息安全', collapsed: true, items: [
            { label: '课程总览', link: '/courses/information-security/' },
            { label: '课程作业', collapsed: true, items: [{ autogenerate: { directory: 'courses/information-security/homework' } }] },
            { label: '复习与总结', collapsed: true, items: [{ autogenerate: { directory: 'courses/information-security/review' } }] },
          ] },
          { label: '音乐与数学', collapsed: true, items: [
            { label: '课程总览', link: '/courses/music-and-mathematics/' },
            { label: '课程笔记', collapsed: true, items: [{ autogenerate: { directory: 'courses/music-and-mathematics/lessons' } }] },
          ] },
          { label: '英美戏剧', collapsed: true, items: [
            { label: '课程总览', link: '/courses/british-american-drama/' },
            { label: '课程笔记', collapsed: true, items: [{ autogenerate: { directory: 'courses/british-american-drama/notes' } }] },
          ] },
          { label: '计算机体系结构', collapsed: true, items: [{ label: '缓存层次与命中率（示例）', link: '/courses/example-cache-hierarchy/' }] },
        ] },
        { label: '论文阅读', collapsed: true, items: [{ autogenerate: { directory: 'papers' } }] },
      ],
    }),
  ],
});
