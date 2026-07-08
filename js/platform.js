(function () {
  const STORAGE_KEYS = {
    users: 'gameUsers',
    currentUser: 'gameCurrentUser',
    guestMode: 'gameGuestMode',
    rememberMe: 'gameRememberMe',
    settings: 'gameSettings'
  };

  function safeParse(value, fallback) {
    try { return value ? JSON.parse(value) : fallback; } catch (e) { return fallback; }
  }

  function encodeText(value) {
    const text = String(value);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) + 3);
    }
    return btoa(result);
  }

  function decodeText(value) {
    try {
      const text = atob(value);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) - 3);
      }
      return result;
    } catch (e) {
      return '';
    }
  }

  function getUsers() {
    return safeParse(localStorage.getItem(STORAGE_KEYS.users), []);
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }

  function getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.currentUser);
    return raw ? safeParse(raw, null) : null;
  }

  function setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  }

  function clearCurrentUser() {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    localStorage.removeItem(STORAGE_KEYS.guestMode);
    localStorage.removeItem(STORAGE_KEYS.rememberMe);
  }

  function getSettings() {
    const defaultSettings = {
      theme: 'neon',
      mode: 'dark',
      sound: true,
      volume: 0.65,
      mute: false,
      lastLogin: ''
    };
    return Object.assign(defaultSettings, safeParse(localStorage.getItem(STORAGE_KEYS.settings), {}));
  }

  function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }

  function getUserByNickname(nickname) {
    return getUsers().find(function (user) {
      return user.nickname.toLowerCase() === nickname.toLowerCase();
    });
  }

  function createUserProfile(data) {
    return {
      nickname: data.nickname,
      email: data.email,
      password: encodeText(data.password),
      createdAt: new Date().toISOString(),
      lastLogin: '',
      bestScores: {},
      checkIn: { streak: 0, lastDate: '' }
    };
  }

  function registerUser(data) {
    const users = getUsers();
    if (!data.nickname || !data.email || !data.password || !data.confirmPassword) {
      return { ok: false, message: '请完整填写注册信息。' };
    }
    if (data.password !== data.confirmPassword) {
      return { ok: false, message: '两次输入的密码不一致。' };
    }
    if (getUserByNickname(data.nickname)) {
      return { ok: false, message: '昵称已被占用，请更换。' };
    }
    const user = createUserProfile(data);
    users.push(user);
    saveUsers(users);
    return { ok: true, message: '注册成功，立即登录体验。', user: user };
  }

  function loginUser(payload) {
    const users = getUsers();
    const user = users.find(function (item) {
      return item.nickname.toLowerCase() === payload.nickname.toLowerCase();
    });
    if (!user) {
      return { ok: false, message: '用户不存在。' };
    }
    if (decodeText(user.password) !== payload.password) {
      return { ok: false, message: '密码错误。' };
    }
    user.lastLogin = new Date().toISOString();
    saveUsers(users);
    setCurrentUser(user);
    if (payload.rememberMe) {
      localStorage.setItem(STORAGE_KEYS.rememberMe, '1');
    } else {
      localStorage.removeItem(STORAGE_KEYS.rememberMe);
    }
    localStorage.removeItem(STORAGE_KEYS.guestMode);
    return { ok: true, message: '登录成功。', user: user };
  }

  function loginGuest() {
    const guest = {
      nickname: 'Guest' + Math.floor(1000 + Math.random() * 9000),
      email: 'guest@local',
      password: '',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      bestScores: {},
      checkIn: { streak: 0, lastDate: '' },
      guest: true
    };
    setCurrentUser(guest);
    localStorage.setItem(STORAGE_KEYS.guestMode, '1');
    localStorage.removeItem(STORAGE_KEYS.rememberMe);
    return guest;
  }

  function logout() {
    clearCurrentUser();
    return true;
  }

  function saveScore(gameName, score) {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    const safeScore = Number(score) || 0;
    const existing = Number(currentUser.bestScores[gameName] || 0);
    if (safeScore > existing) {
      currentUser.bestScores[gameName] = safeScore;
      const users = getUsers();
      const target = users.find(function (user) {
        return user.nickname === currentUser.nickname && user.email === currentUser.email;
      });
      if (target) {
        target.bestScores[gameName] = safeScore;
        saveUsers(users);
      }
      setCurrentUser(currentUser);
    }
    return currentUser.bestScores[gameName] || 0;
  }

  function getBestScore(gameName) {
    const currentUser = getCurrentUser();
    if (!currentUser) return 0;
    return Number(currentUser.bestScores[gameName] || 0);
  }

  function getRankings() {
    return getUsers()
      .map(function (user) {
        const bestScore = Object.values(user.bestScores || {}).reduce(function (sum, val) {
          return sum + Number(val || 0);
        }, 0);
        return { nickname: user.nickname, bestScore: bestScore, guest: !!user.guest };
      })
      .sort(function (a, b) { return b.bestScore - a.bestScore; })
      .slice(0, 10);
  }

  function checkIn() {
    const user = getCurrentUser();
    if (!user) return { ok: false, message: '请先登录。' };
    const today = new Date().toISOString().slice(0, 10);
    const checkIn = user.checkIn || { streak: 0, lastDate: '' };
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let streak = checkIn.streak || 0;
    if (checkIn.lastDate === today) {
      return { ok: false, message: '今日已签到。' };
    }
    if (checkIn.lastDate === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }
    checkIn.streak = streak;
    checkIn.lastDate = today;
    user.checkIn = checkIn;
    const users = getUsers();
    const target = users.find(function (item) {
      return item.nickname === user.nickname && item.email === user.email;
    });
    if (target) {
      target.checkIn = checkIn;
      saveUsers(users);
    }
    setCurrentUser(user);
    return { ok: true, message: '签到成功，连续签到' + streak + '天。', streak: streak };
  }

  function isLoggedIn() {
    return !!getCurrentUser();
  }

  window.gamePlatform = {
    STORAGE_KEYS: STORAGE_KEYS,
    getUsers: getUsers,
    saveUsers: saveUsers,
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser,
    clearCurrentUser: clearCurrentUser,
    getSettings: getSettings,
    saveSettings: saveSettings,
    registerUser: registerUser,
    loginUser: loginUser,
    loginGuest: loginGuest,
    logout: logout,
    saveScore: saveScore,
    getBestScore: getBestScore,
    getRankings: getRankings,
    checkIn: checkIn,
    isLoggedIn: isLoggedIn,
    getUserByNickname: getUserByNickname,
    decodeText: decodeText
  };
})();
