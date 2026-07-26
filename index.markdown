---
layout: home
title: Home
---

面向体系结构与空间数据流加速器（SDA）的论文阅读笔记站。完整笔记在 [论文笔记]({{ "/papers/" | relative_url }})。

<section class="home-papers">
  <h2>最近笔记</h2>
  <ul class="papers-list">
    {% assign papers = site.papers | sort: "year" | reverse %}
    {% for paper in papers limit: 4 %}
    <li class="paper-card">
      <div class="paper-meta">
        {% if paper.venue %}<span class="paper-venue">{{ paper.venue }}</span>{% endif %}
        {% if paper.year %}<span class="paper-year">{{ paper.year }}</span>{% endif %}
      </div>
      <h3 class="paper-card-title">
        <a href="{{ paper.url | relative_url }}">{{ paper.title }}</a>
      </h3>
      {% if paper.summary %}
      <p class="paper-card-summary">{{ paper.summary }}</p>
      {% endif %}
    </li>
    {% endfor %}
  </ul>
  <p><a href="{{ "/papers/" | relative_url }}">查看全部论文笔记 →</a></p>
</section>
