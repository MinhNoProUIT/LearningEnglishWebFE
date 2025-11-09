export interface ITransactionListItem {
    id: string | null;
    name: string | null;
    avatar: string | null;
    amount: number | null;
    date: Date;
    content: string | null;
}
