export interface IPostListItem {
    id: number | null;
    title: string | null;
    createdBy: string | null;
    createdById: string | null;
    createdByAvatar: string | null;
    createdDate: Date;
    totalPosts: number;
    likesCount: number;
    sharesCount: number;
    isReported: boolean;
}
