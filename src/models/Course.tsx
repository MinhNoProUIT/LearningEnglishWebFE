export interface IGetAllCourses {
  id: string;
  title: string;
  level?: string;
  description?: string;
  image_url?: string;
  price: number;
  created_date: Date;
  completion_rate?: number;
  difficulty_level?: string;
  enrollment_count: number;
  estimated_hours?: number;
  is_published: boolean;
  total_words: number;
  updated_at: Date;
}

export interface ICreateCourse {
  title: string;
  topic_id: string;
  level?: string;
  description?: string;
  image_url?: string;
  price: number;
}

export interface IUpdateCourse {
  title: string;
  topic_id?: string;
  level?: string;
  description?: string;
  image_url?: string;
  price: number;
}
