export interface Contact {
    id: string;
    name: string;
    phone: string;
    avatarUrl?: string;
    bankingName: string;
}

export interface Transaction {
    id: string;
    contactId: string;
    amount: number;
    type: 'sent' | 'received';
    status: 'paid' | 'pending' | 'failed';
    note?: string;
    createdAt: Date;
}

export interface UserAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    balance: number;
}
