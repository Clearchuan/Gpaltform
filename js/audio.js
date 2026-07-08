// 账户与会话管理模块（本地 localStorage）
// 数据结构说明（localStorage 中）：
// gp_users  -> { email1: {nickname, email, passHash, salt, createdAt, games:{}, lastCheckIn, settings:{} }, ... }
// gp_current -> { email or 'guest', expires:timestamp } 如果记住登录则不会过期
// 所有函数均为 Promise-friendly（用于等待 Crypto API）

const Auth = (function(){
  const USERS_KEY = 'gp_users';
  const CURRENT_KEY = 'gp_current';

  // 辅助：获取所有用户对象数组
  function getAllUsersRaw() {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  }
  // 返回用户数组（便于排行榜）
  function getAllUsers() {
    const map = getAllUsersRaw();
    return Object.values(map);
  }

  // 保存 users map
  function saveUsers(map) {
    localStorage.setItem(USERS_KEY, JSON.stringify(map));
  }

  // 生成随机 salt
  function genSalt() {
    return Math.random().toString(36).slice(2,10);
  }

  // 使用 Web Crypto 计算 SHA-256，再与 salt 组合，返回 hex
  async function hashPassword(password, salt){
    const enc = new TextEncoder();
    let data = enc.encode(password + '|' + (salt||''));
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', data);
      const arr = Array.from(new Uint8Array(buf));
      return arr.map(b=>b.toString(16).padStart(2,'0')).join('');
    } else {
      // 退化方案（不安全，仅兼容）
      return btoa(password + (salt||''));
    }
  }

  // 注册新用户（email 必须唯一）
  async function register({nickname, email, password}) {
    email = (email||'').toLowerCase();
    const map = getAllUsersRaw();
    if (!email) return {success:false, message:'请输入邮箱'};
    if (map[email]) return {success:false, message:'该邮箱已被注册'};
    const salt = genSalt();
    const passHash = await hashPassword(password, salt);
    const user = {
      nickname: nickname || email.split('@')[0],
      email,
      passHash,
      salt,
      createdAt: Date.now(),
      games: {},
      settings: {theme:'dark', skin:'neon'},
      lastCheckIn: null
    };
    map[email] = user;
    saveUsers(map);
    // 登录新用户并记住
    setCurrentUser(email, true);
    return {success:true, user};
  }

  // 登录（identifier 可以为邮箱或昵称）
  async function login(identifier, password, remember) {
    const map = getAllUsersRaw();
    identifier = (identifier||'').toLowerCase();
    // 尝试按邮箱匹配
    let user = map[identifier] || Object.values(map).find(u => (u.nickname||'').toLowerCase() === identifier);
    if (!user) return {success:false, message:'账号不存在'};
    const hash = await hashPassword(password, user.salt);
    if (hash !== user.passHash) return {success:false, message:'密码错误'};
    setCurrentUser(user.email, remember);
    return {success:true};
  }

  // 游客免登：创建或使用特别标识 guest:{id}
  function loginGuest() {
    const guestId = 'guest_' + Math.random().toString(36).slice(2,8);
    // 游客保存在 users 中但标记无邮箱
    const map = getAllUsersRaw();
    map[guestId] = map[guestId] || {
      nickname: '游客' + guestId.slice(-4),
      email: '',
      guest:true,
      createdAt: Date.now(),
      games:{},
      settings:{theme:'dark', skin:'neon'}
    };
    saveUsers(map);
    setCurrentUser(guestId, false);
    return true;
  }

  // 设置当前登录（存储 localStorage）
  function setCurrentUser(emailOrId, remember) {
    const obj = { id: emailOrId, setAt: Date.now() };
    if (remember) {
      localStorage.setItem(CURRENT_KEY, JSON.stringify(obj));
    } else {
      sessionStorage.setItem(CURRENT_KEY, JSON.stringify(obj));
    }
  }

  // 获取当前用户对象（或 null）
  function getCurrentUser() {
    let cur = sessionStorage.getItem(CURRENT_KEY) || localStorage.getItem(CURRENT_KEY);
    if (!cur) return null;
    try {
      const {id} = JSON.parse(cur);
      const users = getAllUsersRaw();
      return users[id] || null;
    } catch(e) {
      return null;
    }
  }

  // 获取当前用户记录的引用（可用于写入 games 等）
  function getUserRecord() {
    const cur = sessionStorage.getItem(CURRENT_KEY) || localStorage.getItem(CURRENT_KEY);
    if (!cur) return null;
    const {id} = JSON.parse(cur);
    const map = getAllUsersRaw();
    return map[id] || null;
  }

  // 保存当前用户完整对象回 localStorage users map
  function saveCurrentUserRecord(userObj) {
    const cur = sessionStorage.getItem(CURRENT_KEY) || localStorage.getItem(CURRENT_KEY);
    if (!cur) return false;
    const {id} = JSON.parse(cur);
    const map = getAllUsersRaw();
    map[id] = userObj;
    saveUsers(map);
    return true;
  }

  // 退出登录（清除 session 与 local current）
  function logout() {
    sessionStorage.removeItem(CURRENT_KEY);
    localStorage.removeItem(CURRENT_KEY);
  }

  // 每日签到：标记用户 lastCheckIn 为当天日期字符串
  function checkIn() {
    const user = getUserRecord();
    if (!user) return {success:false, message:'未登录'};
    const today = new Date().toISOString().slice(0,10);
    if (user.lastCheckIn === today) return {success:false, message:'今天已签到'};
    user.lastCheckIn = today;
    // 赠送简单奖励：在 settings 中记录 coins
    user.settings.coins = (user.settings.coins||0) + 10;
    saveCurrentUserRecord(user);
    return {success:true, coins:user.settings.coins};
  }

  // 设置用户个性化设置（theme/skin 等）
  function setSetting(key,value) {
    const user = getUserRecord();
    if (!user) return false;
    user.settings = user.settings || {};
    user.settings[key] = value;
    saveCurrentUserRecord(user);
    return true;
  }

  // 外部导出
  return {
    register, login, loginGuest, getCurrentUser, logout,
    getUserRecord, saveCurrentUserRecord,
    checkIn, setSetting, getAllUsers, getAllUsersRaw
  };
})();
