// src/models/Word.tsx
// ==================== WORD INTERFACES ====================

export interface IWord {
    id: string;
    englishname: string;
    vietnamesename: string;
    transcription?: string;
    antonyms: string[];
    synonyms: string[];
    example_sentence?: string;
    image_url?: string;
    difficulty_level?: string;
    word_type?: string;
    minor_topic_id?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Mapped interface for vocabulary page (matching existing component)
export interface IVocabulary {
    id: string;
    word: string;           // englishname
    phonetic: string;       // transcription
    meaning: string;        // vietnamesename
    example: string;        // example_sentence
    exampleTranslation: string;
    image: string;          // image_url
    wordType?: string;      // word_type
    synonyms?: string[];
    antonyms?: string[];
}

// Transform IWord to IVocabulary
export const transformWordToVocabulary = (word: IWord): IVocabulary => ({
    id: word.id,
    word: word.englishname,
    phonetic: word.transcription || "",
    meaning: word.vietnamesename,
    example: word.example_sentence || "",
    exampleTranslation: "", // Not in current schema, can add later
    image: word.image_url || "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=500&fit=crop",
    wordType: word.word_type,
    synonyms: word.synonyms,
    antonyms: word.antonyms,
});
