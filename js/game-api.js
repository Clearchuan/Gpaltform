// 游戏存档 API：所有游戏页面使用此模块保存/读取当前登录用户的成绩数据
// 使用示例： GamesAPI.saveResult('2048', score);
// 每个用户的数据 structure 在 Auth.getUserRecord().games 中： { gameId: { best:..., plays:..., last:... } }

const GamesAPI = (function(){
  // 保存单局结果：会自动更新最高分和游玩次数
  function saveResult(gameId, score) {
    const user = Auth.getUserRecord();
    if (!user) {
      console.warn('未登录，成绩不会被保存（游客请先登录）');
      return false;
    }
    user.games = user.games || {};
    const rec = user.games[gameId] || {best:0, plays:0, last:0};
    rec.plays = (rec.plays||0) + 1;
    rec.last = score;
    if (score > (rec.best||0)) rec.best = score;
    user.games[gameId] = rec;
    Auth.saveCurrentUserRecord(user);
    return true;
  }

  function getGameRecord(gameId) {
    const user = Auth.getUserRecord();
    if (!user) return {best:0, plays:0, last:0};
    return user.games && user.games[gameId] ? user.games[gameId] : {best:0, plays:0, last:0};
  }

  // 返回所有已知游戏列表（由大厅使用）
  const GAMES = [
    {id:'2048', title:'2048', file:'games/2048.html', preview:'assets/images/2048-preview.png'},
    {id:'Racing', title:'Racing', file:'games/Racing.html', preview:'assets/images/racing-preview.png'},
    {id:'breakout', title:'Breakout', file:'games/breakout.html', preview:'assets/images/breakout-preview.png'},
    {id:'guessword', title:'Guess Word', file:'games/guessword.html', preview:'assets/images/guessword-preview.png'},
    {id:'memory', title:'Memory', file:'games/memory.html', preview:'assets/images/memory-preview.png'},
    {id:'plane', title:'Plane', file:'games/plane.html', preview:'assets/images/plane-preview.png'},
    {id:'puzzle', title:'Puzzle', file:'games/puzzle.html', preview:'assets/images/puzzle-preview.png'},
    {id:'snake', title:'Snake', file:'games/snake.html', preview:'assets/images/snake-preview.png'},
    {id:'tank', title:'Tank', file:'games/tank.html', preview:'assets/images/tank.html.png'},
    {id:'tetris', title:'Tetris', file:'games/tetris.html', preview:'assets/images/tetris-preview.png'},
    {id:'tictactoe', title:'TicTacToe', file:'games/tictactoe.html', preview:'assets/images/tictactoe-preview.png'},
    {id:'tower', title:'Tower', file:'games/tower.html', preview:'assets/images/tower-preview.png'},
    {id:'wordchain', title:'WordChain', file:'games/wordchain.html', preview:'assets/images/wordchain-preview.png'}
  ];

  function listGames(){ return GAMES; }

  return { saveResult, getGameRecord, listGames, getGameRecord };
})();
