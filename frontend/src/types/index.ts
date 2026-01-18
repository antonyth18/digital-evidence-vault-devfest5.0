export type EvidenceStatus = 'verified' | 'flagged' | 'breached' | 'pending';

export type EvidenceType = 'Video' | 'Audio' | 'Document' | 'Image' | 'Other';

export interface Evidence {
    id: string;
    type: EvidenceType;
    source: string;
    collectedBy: string;
    date: string;
    status: EvidenceStatus;
    hash: string;
    txId?: string;
    size?: string;
}

export interface User {
    id: string;
    name: string;
    role: 'Officer' | 'Detective' | 'Admin' | 'Prosecutor' | 'Judge';
    badgeNumber: string;
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    details: string;
    hash: string;
    severity: 'low' | 'medium' | 'high';
}

export interface Alert {
    id: number;
    severity: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    timestamp: string;
    evidenceId?: string;
}
