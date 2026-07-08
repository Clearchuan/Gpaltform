(function () {
  function saveCurrentGameScore(gameName, score) {
    if (window.gamePlatform && window.gamePlatform.saveScore) {
      return window.gamePlatform.saveScore(gameName, score);
    }
    return 0;
  }

  function getCurrentBestScore(gameName) {
    if (window.gamePlatform && window.gamePlatform.getBestScore) {
      return window.gamePlatform.getBestScore(gameName);
    }
    return 0;
  }

  window.gameApi = {
    saveCurrentGameScore: saveCurrentGameScore,
    getCurrentBestScore: getCurrentBestScore
  };

  window.saveGameScore = saveCurrentGameScore;
})();
