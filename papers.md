---
layout: page
title: 论文笔记
permalink: /papers/
---

<p class="papers-intro">
  本站用 Jekyll <code>collections</code> 管理论文阅读笔记（目录 <code>_papers/</code>），按年份倒序排列。
</p>

<ul class="papers-list">
  {% assign papers = site.papers | sort: "year" | reverse %}
  {% for paper in papers %}
  <li class="paper-card">
    <div class="paper-meta">
      {% if paper.venue %}<span class="paper-venue">{{ paper.venue }}</span>{% endif %}
      {% if paper.year %}<span class="paper-year">{{ paper.year }}</span>{% endif %}
      {% for tag in paper.tags %}<span class="paper-tag">{{ tag }}</span>{% endfor %}
    </div>
    <h2 class="paper-card-title">
      <a href="{{ paper.url | relative_url }}">{{ paper.title }}</a>
    </h2>
    {% if paper.authors %}
    <p class="paper-card-authors">{{ paper.authors }}</p>
    {% endif %}
    {% if paper.summary %}
    <p class="paper-card-summary">{{ paper.summary }}</p>
    {% endif %}
  </li>
  {% endfor %}
</ul>
