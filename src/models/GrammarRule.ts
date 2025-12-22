export interface IGrammarRule {
  id: string;
  topic_id: string;
  title: string;
  structure: string;
  note: string;
  created_at: string;
}

export interface IGrammarRuleCreate {
  topic_id: string;
  title: string;
  structure?: string;
  note?: string;
}

export interface IGrammarRuleUpdate {
  topic_id?: string;
  title?: string;
  structure?: string;
  note?: string;
}

export interface IGrammarRuleResponse {
  data: IGrammarRule[];
  total: number;
}
