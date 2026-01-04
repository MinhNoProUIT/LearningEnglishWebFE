export interface VocabularyWord {
    id?: number;
    english: string;
    vietnamese: string;
    image?: string; // Optional for PictureGuessGame
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Select random words from vocabulary array
 */
export function selectRandomWords(words: VocabularyWord[], count: number): VocabularyWord[] {
    if (words.length <= count) {
        return words;
    }
    return shuffleArray(words).slice(0, count);
}

/**
 * Calculate dynamic win score based on word count
 */
export function calculateWinScore(wordCount: number): number {
    return wordCount * 10;
}
