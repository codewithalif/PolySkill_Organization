import json

with open('yt_dump.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

contents = d['contents']['twoColumnBrowseResultsRenderer']['tabs'][0]['tabRenderer']['content']['sectionListRenderer']['contents'][0]['itemSectionRenderer']['contents']

lessons = []
for idx, item in enumerate(contents, 1):
    vm = item.get('lockupViewModel', {})
    vid = vm.get('contentId')
    meta = vm.get('metadata', {}).get('lockupMetadataViewModel', {})
    title = meta.get('title', {}).get('content', '')
    
    duration = ''
    try:
        overlays = vm.get('contentImage', {}).get('thumbnailViewModel', {}).get('overlays', [])
        for ov in overlays:
            bottom = ov.get('thumbnailBottomOverlayViewModel', {})
            badges = bottom.get('badges', [])
            for b in badges:
                badge = b.get('thumbnailBadgeViewModel', {})
                if 'text' in badge:
                    duration = badge['text']
    except Exception:
        pass

    lessons.append({
        'serial': idx,
        'videoId': vid,
        'title': title,
        'duration': duration,
        'url': f'https://www.youtube.com/watch?v={vid}&list=PLSNRR4BKcowBkHYYumZffsZ3G52hPqRjc'
    })

print(f'Parsed {len(lessons)} official lessons:')
for l in lessons:
    print(f"{l['serial']}. [{l['videoId']}] {l['title']} ({l['duration']})")

with open('official_html_lessons.json', 'w', encoding='utf-8') as f:
    json.dump(lessons, f, ensure_ascii=False, indent=2)
