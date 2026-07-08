(function () {
  const games = [
    { id: '2048', name: '2048', path: 'games/2048.html', preview: 'assets/images/2048-preview.png' },
    { id: 'Racing', name: '2D赛车', path: 'games/Racing.html', preview: 'assets/images/racing-preview.png' },
    { id: 'breakout', name: '打砖块', path: 'games/breakout.html', preview: 'assets/images/breakout-preview.png' },
    { id: 'guessword', name: '猜单词', path: 'games/guessword.html', preview: 'assets/images/guessword-preview.png' },
    { id: 'memory', name: '记忆翻牌', path: 'games/memory.html', preview: 'assets/images/memory-preview.png' },
    { id: 'plane', name: '像素飞机', path: 'games/plane.html', preview: 'assets/images/plane-preview.png' },
    { id: 'puzzle', name: '拼图', path: 'games/puzzle.html', preview: 'assets/images/puzzle-preview.png' },
    { id: 'snake', name: '贪吃蛇', path: 'games/snake.html', preview: 'assets/images/snake-preview.png' },
    { id: 'tank', name: '坦克大战', path: 'games/tank.html', preview: 'assets/images/tank-preview.png' },
    { id: 'tetris', name: '俄罗斯方块', path: 'games/tetris.html', preview: 'assets/images/tetris-preview.png' },
    { id: 'tictactoe', name: '井字棋', path: 'games/tictactoe.html', preview: 'assets/images/tictactoe-preview.png' },
    { id: 'tower', name: '塔防', path: 'games/tower.html', preview: 'assets/images/tower-preview.png' },
    { id: 'wordchain', name: '词语接龙', path: 'games/wordchain.html', preview: 'assets/images/wordchain-preview.png' }
  ];

  function renderHall() {
    const container = document.getElementById('gamesGrid');
    if (!container) return;
    const currentUser = window.gamePlatform.getCurrentUser();
    const currentUserName = currentUser ? currentUser.nickname : '游客';
    document.getElementById('welcomeText').textContent = currentUser ? '欢迎回到赛博游戏厅，' + currentUserName : '欢迎来到赛博游戏厅';
    if (!currentUser) {
      window.location.href = 'login.html';
      return;
    }
    const fragment = document.createDocumentFragment();
    games.forEach(function (game) {
      const card = document.createElement('article');
      card.className = 'game-card';
      const best = window.gamePlatform.getBestScore(game.id) || 0;
      card.innerHTML = [
        '<img src="' + game.preview + '" alt="' + game.name + '">',
        '<div class="card-body">',
        '<div class="card-title">' + game.name + '</div>',
        '<div class="card-meta"><span>最高分</span><strong>' + best + '</strong></div>',
        '<a class="play-link" href="' + game.path + '">进入游戏</a>',
        '</div>'
      ].join('');
      fragment.appendChild(card);
    });
    container.innerHTML = '';
    container.appendChild(fragment);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (window.gamePlatform && window.gamePlatform.isLoggedIn) {
      if (!window.gamePlatform.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
      }
    }
    renderHall();
  });

  window.renderHall = renderHall;
})();
