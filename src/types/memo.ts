// Memos API 类型定义
// 参考: https://github.com/yxksw/cfmemos/tree/main/backend

export interface Memo {
  id: number;
  rowStatus: "NORMAL" | "ARCHIVED" | "DELETED";
  creatorId: number;
  createdTs: number;
  updatedTs: number;
  displayTs: number;
  content: string;
  visibility: "PUBLIC" | "PRIVATE" | "PROTECTED";
  pinned: boolean;
  parent: number | null;
  creatorName: string;
  creatorUsername: string;
  resourceList: Resource[];
  relationList: Relation[];
  tagList: string[];
  creatorEmailHash: string;
}

export interface Resource {
  id: number;
  createdTs: number;
  updatedTs: number;
  filename: string;
  externalLink: string;
  type: string;
  size: number;
  relatedMemoId?: number;
}

export interface Relation {
  id: number;
  memoId: number;
  relatedMemoId: number;
  type: string;
}

export interface CreateMemoRequest {
  content: string;
  visibility?: "PUBLIC" | "PRIVATE" | "PROTECTED";
  resourceIdList?: number[];
}

export interface UpdateMemoRequest {
  content?: string;
  visibility?: "PUBLIC" | "PRIVATE" | "PROTECTED";
  pinned?: boolean;
  rowStatus?: "NORMAL" | "ARCHIVED" | "DELETED";
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

// 评论类型
export interface Comment {
  id: number;
  postId: number;
  name: string;
  email?: string;
  content: string;
  avatar?: string;
  createdAt: string;
}

// 音乐类型
export interface MusicSong {
  title: string;
  author: string;
  url: string;
  pic: string;
  lrc?: string;
}
