// src/models/MajorTopic.tsx
// ==================== MAJOR TOPIC INTERFACES ====================

export interface IMajorTopic {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    color_gradient?: string;
    order_index: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Computed fields from backend (optional)
    minor_topics_count?: number;
    vocabulary_count?: number;
    completed?: boolean;
    progress?: number;
}

export interface ICreateMajorTopic {
    name: string;
    description?: string;
    icon?: string;
    color_gradient?: string;
    order_index?: number;
}

export interface IUpdateMajorTopic extends Partial<ICreateMajorTopic> { }
