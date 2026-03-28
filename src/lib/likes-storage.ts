// 本地存储点赞数据（当数据库不可用时使用）
const STORAGE_KEY = 'cfmemos-likes';

interface LikeRecord {
  memoId: number;
  userFingerprint: string;
  createdAt: string;
}

// 获取用户指纹
function getUserFingerprint(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const userAgent = navigator.userAgent || '';
  let hash = 0;
  for (let i = 0; i < userAgent.length; i++) {
    const char = userAgent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// 获取所有点赞记录
function getAllLikes(): LikeRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 保存点赞记录
function saveLikes(likes: LikeRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(likes));
  } catch {
    // 忽略存储错误
  }
}

// 获取说说的点赞数
export function getLikesCount(memoId: number): number {
  const likes = getAllLikes();
  return likes.filter(like => like.memoId === memoId).length;
}

// 检查用户是否已点赞
export function hasUserLiked(memoId: number): boolean {
  const userFingerprint = getUserFingerprint();
  const likes = getAllLikes();
  return likes.some(like => like.memoId === memoId && like.userFingerprint === userFingerprint);
}

// 点赞
export function addLike(memoId: number): number {
  if (hasUserLiked(memoId)) {
    return getLikesCount(memoId);
  }
  const likes = getAllLikes();
  likes.push({
    memoId,
    userFingerprint: getUserFingerprint(),
    createdAt: new Date().toISOString(),
  });
  saveLikes(likes);
  return getLikesCount(memoId);
}

// 取消点赞
export function removeLike(memoId: number): number {
  const userFingerprint = getUserFingerprint();
  let likes = getAllLikes();
  likes = likes.filter(like => !(like.memoId === memoId && like.userFingerprint === userFingerprint));
  saveLikes(likes);
  return getLikesCount(memoId);
}

// 获取点赞数据（用于 API 响应）
export function getLikeData(memoId: number): { count: number; hasLiked: boolean } {
  return {
    count: getLikesCount(memoId),
    hasLiked: hasUserLiked(memoId),
  };
}
