// ==================== MESSAGE ====================
export type MessageSender = "USER" | "AI";

export interface IChatMessage {
  id: string;
  session_id: string;
  sender: MessageSender;
  content: string;
  created_at: string;
}

// ==================== SESSION ====================
export interface IChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message: IChatMessage | null;
}

export interface IChatSessionListItem {
  id: string;
  title: string;
  last_message_preview: string;
  last_message_time: string | null;
  updated_at: string;
}

// ==================== REQUEST PARAMS ====================
export interface IGetSessionsParams {
  page?: number;
  limit?: number;
}

export interface IGetHistoryParams {
  sessionId: string;
  page?: number;
  limit?: number;
}

export interface ICreateSessionRequest {
  title?: string;
}

export interface ISendMessageRequest {
  sessionId: string;
  content: string;
}

// ==================== RESPONSE ====================
export interface IPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// POST /api/chat - Create session
export interface ICreateSessionResponse {
  session: IChatSession;
  welcome_message: IChatMessage;
}

// GET /api/chat - Get sessions list
export interface IGetSessionsResponse {
  data: IChatSessionListItem[];
  pagination: IPagination;
}

// GET /api/chat/suggestions
export interface IGetSuggestionsResponse {
  data: string[];
}

// GET /api/chat/:sessionId - Get history
export interface IGetHistoryResponse {
  data: {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    messages: IChatMessage[];
  };
  pagination: IPagination;
}

// POST /api/chat/:sessionId/message - Send message
export interface ISendMessageResponse {
  user_message: IChatMessage;
  ai_message: IChatMessage;
}

// DELETE /api/chat/:sessionId/messages - Clear messages
export interface IClearMessagesResponse {
  deleted_count: number;
  welcome_message: IChatMessage;
}