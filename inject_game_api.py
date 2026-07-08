from pathlib import Path
root = Path(r'c:\Users\lenovo\Desktop\Clearchuan.github.io-master\Clearchuan.github.io-master\games')
for path in root.glob('*.html'):
    text = path.read_text(encoding='utf-8')
    if '../js/game-api.js' not in text and '</body>' in text:
        insert = '\n  <script src="../js/game-api.js"></script>\n'
        text = text.replace('</body>', insert + '</body>')
        path.write_text(text, encoding='utf-8')
print('injected')
