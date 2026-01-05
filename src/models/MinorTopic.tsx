// src/models/MinorTopic.tsx
// ==================== MINOR TOPIC INTERFACES ====================

export interface IMinorTopic {
    id: string;
    major_topic_id: string;
    name: string;
    description?: string;
    icon?: string;
    order_index: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Computed fields from backend
    _count?: {
        words: number;
    };
    vocabulary_count?: number;
    completed?: boolean;
    progress?: number;
}
