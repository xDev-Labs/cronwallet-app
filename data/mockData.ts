import { Contact, Transaction, UserAccount } from '../types/payment';

export const mockContacts: Contact[] = [
    {
        id: '1',
        name: 'John Doe',
        phone: '+91 98765 43210',
        bankingName: 'HOUSE EXPENSES',
    },
    {
        id: '2',
        name: 'Jane Doe',
        phone: '+91 92075 18506',
        avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
        bankingName: 'Mrs NOORJAHAN',
    },
    {
        id: '3',
        name: 'John Smith',
        phone: '+91 97460 82231',
        avatarUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200',
        bankingName: 'MUHAMMED HASHIR P M',
    },
    {
        id: '4',
        name: 'Jane Smith',
        phone: '+91 99887 76655',
        bankingName: 'VIBES GROUP',
    },
    {
        id: '5',
        name: 'John Doe',
        phone: '+91 98123 45678',
        bankingName: 'RAVI KUMAR',
    },
    {
        id: '6',
        name: 'Jane Doe',
        phone: '+91 98765 12345',
        avatarUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
        bankingName: 'PALLAVI SHARMA',
    },
    {
        id: '7',
        name: 'John Doe',
        phone: '+91 97654 32109',
        bankingName: 'HARIBABU REDDY',
    },
];

export const mockTransactions: Transaction[] = [
    {
        id: '1',
        contactId: '2',
        amount: 40000,
        type: 'received',
        status: 'paid',
        createdAt: new Date('2024-09-08T11:56:00'),
    },
    {
        id: '2',
        contactId: '2',
        amount: 16000,
        type: 'received',
        status: 'paid',
        createdAt: new Date('2024-09-10T09:43:00'),
    },
    {
        id: '3',
        contactId: '2',
        amount: 12000,
        type: 'sent',
        status: 'paid',
        createdAt: new Date('2024-09-23T08:57:00'),
    },
];

export const mockUserAccount: UserAccount = {
    id: '1',
    bankName: 'State Bank of India',
    accountNumber: '8817',
    balance: 50000,
};
