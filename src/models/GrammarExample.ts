export interface IGrammarExample {
  id: string;
  topic_id: string;
  rule_id: string;
  example_en: string;
  example_vi: string;
  note: string;
  created_at: string;
}

export interface IGrammarExampleCreate {
  topic_id: string;
  rule_id: string;
  example_en: string;
  example_vi?: string;
  note?: string;
}

export interface IGrammarExampleUpdate {
  topic_id?: string;
  rule_id?: string;
  example_en?: string;
  example_vi?: string;
  note?: string;
}

export interface IGrammarExampleResponse {
  data: IGrammarExample[];
  total: number;
}
