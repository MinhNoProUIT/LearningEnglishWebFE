export interface IGetAllCourses {
  id: string;
  title: string;
  topic_id?: string;
  level?: string;
  description?: string;
  image_url?: string;
  price: number;
  created_date: Date;
  topics?: {
    name: string;
  };
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
