export interface IGrammarVideo {
  id: string;
  topic_id: string;
  title: string;
  url: string;
  created_at: string;
}

export interface IGrammarVideoCreate {
  topic_id: string;
  title: string;
  url: string;
}

export interface IGrammarVideoUpdate {
  topic_id?: string;
  title?: string;
  url?: string;
}

export interface IGrammarVideoResponse {
  data: IGrammarVideo[];
  total: number;
}