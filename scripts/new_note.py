#!/usr/bin/env python3
"""Create an Astro + Starlight Markdown note."""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('kind', choices=['course', 'paper'])
    parser.add_argument('--title', required=True)
    parser.add_argument('--slug', required=True, help='Lowercase URL slug, e.g. lexical-analysis')
    parser.add_argument('--course')
    parser.add_argument('--order', type=int)
    parser.add_argument('--week', type=int, help='Compatibility alias for --order')
    parser.add_argument('--venue')
    parser.add_argument('--year', type=int)
    parser.add_argument('--authors')
    parser.add_argument('--summary', default='')
    parser.add_argument('--tag', action='append', default=[])
    args = parser.parse_args()
    if not re.fullmatch(r'[a-z0-9]+(?:[-_][a-z0-9]+)*', args.slug):
        parser.error('--slug must contain lowercase letters, digits, hyphens or underscores')
    meta = {'title': args.title, 'description': args.summary, 'tags': args.tag}
    if args.kind == 'course':
        if not args.course or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', args.course):
            parser.error('course notes require a valid --course slug')
        order = args.order if args.order is not None else args.week
        if order is None:
            parser.error('course notes require --order')
        folder = ROOT / 'src/content/docs/courses' / args.course
        meta.update(course=args.course, order=order, sidebar={'order': order})
    else:
        if not args.venue or args.year is None:
            parser.error('paper notes require --venue and --year')
        folder = ROOT / 'src/content/docs/papers'
        meta.update(venue=args.venue, year=args.year, sidebar={'order': 2030 - args.year})
        if args.authors:
            meta['authors'] = args.authors
    target = folder / (args.slug + '.md')
    folder.mkdir(parents=True, exist_ok=True)
    front = ''.join(f'{key}: {json.dumps(value, ensure_ascii=False)}\n' for key, value in meta.items())
    try:
        with target.open('x', encoding='utf-8') as file:
            file.write('---\n' + front + '---\n\n<!-- 在此写笔记 -->\n')
    except FileExistsError:
        parser.error(f'Already exists: {target}')
    print(f'Created {target.relative_to(ROOT)}')
    print('Preview: npm run dev. Build: npm run build.')

if __name__ == '__main__':
    main()
