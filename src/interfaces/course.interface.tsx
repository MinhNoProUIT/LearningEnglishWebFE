import { ITopic } from "./topic.interface";

export interface ICourse {
    id: number,
    title: string,
    topic: string,
    level: string,
    description: string,
    image: string,
}