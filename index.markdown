---
layout: home
title: Home
---

<!-- ========== 站内介绍：改这里 ========== -->
<section class="site-intro">
  <h2>关于本站</h2>
  <p>
    这里是 TaxodiumPendragon 的学习笔记站，内容分成两个板块：
  </p>
  <ul>
    <li><a href="{{ "/courses/" | relative_url }}">课程笔记</a> — 按课程归类，课内再用 tag 标主题</li>
    <li><a href="{{ "/papers/" | relative_url }}">论文笔记</a> — 会议 / 年份 / 主题 tag</li>
  </ul>
  <p>
    直接编辑仓库根目录的 <code>index.markdown</code> 即可更新这段介绍；
    推送到 <code>main</code> 后 GitHub Actions 会自动构建发布。
  </p>
</section>
<!-- ========== 站内介绍结束 ========== -->

<section class="home-papers">
  <h2>最近论文笔记</h2>
  <ul class="papers-list">
    {% assign papers = site.papers | sort: "year" | reverse %}
    {% for paper in papers limit: 3 %}
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
  <p><a href="{{ "/papers/" | relative_url }}">全部论文笔记 →</a></p>
</section>

<section class="home-papers">
  <h2>最近课程笔记</h2>
  {% if site.courses.size == 0 %}
  <p class="papers-intro">还没有课程笔记。新建文件放到 <code>_courses/</code>，或运行 <code>python scripts/new_note.py course ...</code>。</p>
  {% else %}
  <ul class="papers-list">
    {% assign courses = site.courses | sort: "date" | reverse %}
    {% for note in courses limit: 3 %}
    <li class="paper-card">
      <div class="paper-meta">
        {% if note.course %}<span class="paper-venue">{{ note.course }}</span>{% endif %}
        {% for tag in note.tags limit: 3 %}<span class="paper-tag">{{ tag }}</span>{% endfor %}
      </div>
      <h3 class="paper-card-title">
        <a href="{{ note.url | relative_url }}">{{ note.title }}</a>
      </h3>
      {% if note.summary %}
      <p class="paper-card-summary">{{ note.summary }}</p>
      {% endif %}
    </li>
    {% endfor %}
  </ul>
  <p><a href="{{ "/courses/" | relative_url }}">全部课程笔记 →</a></p>
  {% endif %}
</section>
