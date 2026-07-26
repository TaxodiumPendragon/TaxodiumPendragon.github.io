#!/usr/bin/env python3
"""Scaffold a new paper/course note. Jekyll itself converts Markdown → HTML.

Usage:
  python scripts/new_note.py paper --slug step --title "STeP" --venue ASPLOS --year 2026
  python scripts/new_note.py course --slug lec01 --title "第1讲" --course computer-architecture --week 1

Then edit the generated .md and run:
  bundle exec jekyll serve
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def slugify(text: str) -> str:
    s = text.strip().lower()
    s = re.sub(r"[^\w\s-]", "", s, flags=re.UNICODE)
    s = re.sub(r"[-\s]+", "-", s).strip("-")
    return s or "untitled"


def write_note(path: Path, front: str, body: str) -> None:
    if path.exists():
        raise SystemExit(f"Already exists: {path}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(front + "\n" + body, encoding="utf-8")
    print(f"Created {path.relative_to(ROOT)}")
    print("Edit the Markdown, then: bundle exec jekyll serve")
    print("(Do not hand-write HTML — Jekyll builds _site/ automatically.)")


def cmd_paper(args: argparse.Namespace) -> None:
    slug = args.slug or slugify(args.title)
    path = ROOT / "_papers" / f"{slug}.md"
    tags = ", ".join(args.tag) if args.tag else "SDA"
    front = f"""---
title: "{args.title}"
venue: {args.venue or "TBD"}
year: {args.year or 2026}
authors: "{args.authors or ""}"
summary: "{args.summary or ""}"
tags: [{tags}]
---
"""
    body = f"# {args.title}\n\n<!-- 在此写论文笔记 -->\n"
    write_note(path, front, body)


def cmd_course(args: argparse.Namespace) -> None:
    slug = args.slug or slugify(args.title)
    path = ROOT / "_courses" / f"{slug}.md"
    tags = ", ".join(args.tag) if args.tag else "lecture"
    week_line = f"week: {args.week}\n" if args.week is not None else ""
    front = f"""---
title: "{args.title}"
course: {args.course}
{week_line}tags: [{tags}]
summary: "{args.summary or ""}"
---
"""
    body = f"# {args.title}\n\n<!-- 在此写课程笔记 -->\n"
    write_note(path, front, body)


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a Jekyll collection note (Markdown source).")
    sub = parser.add_subparsers(dest="kind", required=True)

    p = sub.add_parser("paper", help="Create _papers/<slug>.md")
    p.add_argument("--title", required=True)
    p.add_argument("--slug")
    p.add_argument("--venue")
    p.add_argument("--year", type=int)
    p.add_argument("--authors")
    p.add_argument("--summary")
    p.add_argument("--tag", action="append", default=[])
    p.set_defaults(func=cmd_paper)

    c = sub.add_parser("course", help="Create _courses/<slug>.md")
    c.add_argument("--title", required=True)
    c.add_argument("--course", required=True, help="Course slug, e.g. computer-architecture")
    c.add_argument("--slug")
    c.add_argument("--week", type=int)
    c.add_argument("--summary")
    c.add_argument("--tag", action="append", default=[])
    c.set_defaults(func=cmd_course)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
