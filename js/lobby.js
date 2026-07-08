// 大厅渲染：自动读取 GamesAPI.listGames() 并渲染卡片，显示当前用户最高分
const Lobby = (function(){
  function init() {
    const user = Auth.getCurrentUser();
    document.getElementById('welcome-msg').textContent = `${user.nickname}，欢迎回来！`;
    document.getElementById('user-info').textContent = `${user.nickname}`;
    document.getElementById('logout-btn').addEventListener('click', ()=>{ Auth.logout(); location.href='login.html'; });
    document.getElementById('checkin-btn').addEventListener('click', ()=> {
      const res = Auth.checkIn();
      if (res.success) alert('签到成功，获得金币：' + res.coins);
      else alert(res.message);
    });

    renderGames();
    setupSearch();
    setupAudioControls();
  }

  function renderGames(filter='') {
    const grid = document.getElementById('games-grid');
    const games = GamesAPI.listGames();
    const user = Auth.getUserRecord();
    grid.innerHTML = games.filter(g => g.title.toLowerCase().includes(filter.toLowerCase())).map(g => {
      const rec = GamesAPI.getGameRecord(g.id);
      const best = rec ? rec.best || 0 : 0;
      const preview = g.preview || 'assets/images/seer-preview.png';
      return `<article class="card" data-id="${g.id}">
        <img src="${preview}" alt="${g.title}">
        <div class="body">
          <h4>${g.title}</h4>
          <div class="meta"><span>最高分：${best}</span><span>次数：${rec.plays||0}</span></div>
          <div class="actions">
            <a class="btn primary" href="${g.file}" target="_blank">开始游戏</a>
            <button class="btn" data-id="${g.id}">详情</button>
          </div>
        </div>
      </article>`;
    }).join('');
    // 绑定详情按钮
    grid.querySelectorAll('button[data-id]').forEach(b=>{
      b.addEventListener('click', (e)=>{
        const id = b.getAttribute('data-id');
        alert('游戏：' + id + '\n本地最高分：' + (GamesAPI.getGameRecord(id).best||0));
      });
    });
  }

  function setupSearch() {
    const input = document.getElementById('game-search');
    input.addEventListener('input', (e)=> renderGames(e.target.value));
  }

  function setupAudioControls() {
    const vol = document.getElementById('volume-slider');
    const mute = document.getElementById('mute-toggle');
    vol.value = AudioManager.getVolume();
    vol.addEventListener('input', (e)=> AudioManager.setVolume(parseFloat(e.target.value)));
    mute.addEventListener('click', ()=> AudioManager.toggleMute());
  }

  return { init, renderGames };
})();
