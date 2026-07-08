import os, shutil, glob
root = os.getcwd()
for folder in ['css','js','assets','assets/images','assets/sounds','games']:
    os.makedirs(os.path.join(root, folder), exist_ok=True)
for path in glob.glob(os.path.join(root, '*.png')):
    shutil.copy2(path, os.path.join(root, 'assets', 'images', os.path.basename(path)))
for name in ['2048.html','Racing.html','breakout.html','guessword.html','memory.html','plane.html','puzzle.html','snake.html','tank.html','tetris.html','tictactoe.html','tower.html','wordchain.html']:
    src = os.path.join(root, name)
    dst = os.path.join(root, 'games', name)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        with open(dst, 'r', encoding='utf-8') as f:
            text = f.read()
        if '</body>' in text and '../js/game-api.js' not in text:
            game_name = name.replace('.html', '')
            insert = '\n  <script src="../js/game-api.js"></script>\n  <script>window.__gameApiGameName = "' + game_name + '";</script>\n'
            text = text.replace('</body>', insert + '</body>')
            with open(dst, 'w', encoding='utf-8') as f:
                f.write(text)
print('structure ready')
