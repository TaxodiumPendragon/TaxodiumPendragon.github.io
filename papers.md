---
layout: page
title: 论文笔记
permalink: /papers/
---

<p class="papers-intro">
  论文笔记在 <code>_papers/</code>。板块用 Collection；会议 / 年份在 front matter，主题用 <code>tags</code>。
</p>

{% assign all_tags = site.papers | map: "tags" | join: "," | split: "," | uniq | sort %}
{% if all_tags.size > 0 %}
<p class="papers-intro">主题 tag：
  {% for tag in all_tags %}
    {% assign t = tag | strip %}
    {% if t != "" %}<span class="paper-tag">{{ t }}</span>{% endif %}
  {% endfor %}
</p>
{% endif %}

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
