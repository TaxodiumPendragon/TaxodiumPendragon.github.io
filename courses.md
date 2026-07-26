---
layout: page
title: 课程笔记
permalink: /courses/
---

<p class="papers-intro">
  课程笔记在 <code>_courses/</code>。大板块用 Collection 分开；同一课程用 front matter 的 <code>course</code> 字段归组，主题再用 <code>tags</code>。
</p>

{% assign notes = site.courses %}
{% if notes.size == 0 %}
<p>暂无课程笔记。可用 <code>python scripts/new_note.py course --course computer-architecture --title "第1讲"</code> 创建。</p>
{% else %}

{% assign course_slugs = notes | map: "course" | uniq %}
{% for course_slug in course_slugs %}
  {% assign entry = site.data.courses | where: "slug", course_slug | first %}
  {% assign group = notes | where: "course", course_slug | sort: "week" %}
  <h2 class="course-group-title">
    {% if entry %}{{ entry.name }}{% else %}{{ course_slug }}{% endif %}
    {% if entry.term %} <span class="paper-year">{{ entry.term }}</span>{% endif %}
  </h2>
  <ul class="papers-list">
    {% for note in group %}
    <li class="paper-card">
      <div class="paper-meta">
        {% if note.week %}<span class="paper-year">Week {{ note.week }}</span>{% endif %}
        {% for tag in note.tags %}<span class="paper-tag">{{ tag }}</span>{% endfor %}
      </div>
      <h3 class="paper-card-title"><a href="{{ note.url | relative_url }}">{{ note.title }}</a></h3>
      {% if note.summary %}<p class="paper-card-summary">{{ note.summary }}</p>{% endif %}
    </li>
    {% endfor %}
  </ul>
{% endfor %}

{% endif %}
