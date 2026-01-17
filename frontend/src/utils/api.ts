const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
    /**
     * Get all evidence from the backend
     */
    async getEvidence() {
        const response = await fetch(`${API_BASE_URL}/evidence`);
        if (!response.ok) throw new Error('Failed to fetch evidence');
        return response.json();
    },

    /**
     * Upload and register evidence on blockchain
     */
    async registerEvidence(formData: FormData) {
        const response = await fetch(`${API_BASE_URL}/evidence/upload-blockchain`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }
        return response.json();
    },

    /**
     * Get dashboard summary stats
     */
    async getDashboardSummary() {
        const response = await fetch(`${API_BASE_URL}/analytics/summary`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        return response.json();
    },

    /**
     * Get tamper events for evidence
     */
    async getTamperEvents(evidenceId: string) {
        const response = await fetch(`${API_BASE_URL}/tamper-events/${evidenceId}`);
        if (!response.ok) throw new Error('Failed to fetch tamper events');
        return response.json();
    },

    /**
     * Get all alerts from tamper ledger
     */
    async getAllAlerts() {
        const response = await fetch(`${API_BASE_URL}/alerts`);
        if (!response.ok) throw new Error('Failed to fetch alerts');
        return response.json();
    },

    /**
     * Get system-wide audit logs
     */
    async getAuditLogs() {
        const response = await fetch(`${API_BASE_URL}/audit-log`);
        if (!response.ok) throw new Error('Failed to fetch audit log');
        return response.json();
    },

    /**
     * Get custody events for evidence
     */
    async getCustodyEvents(evidenceId: string) {
        const response = await fetch(`${API_BASE_URL}/custody/${evidenceId}`);
        if (!response.ok) throw new Error('Failed to fetch custody events');
        return response.json();
    },

    /**
     * Log a new custody event
     */
    async logCustodyEvent(evidenceId: string, action: string, handler: string, details?: any) {
        const response = await fetch(`${API_BASE_URL}/custody/${evidenceId}/log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, handler, details })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || error.reason || 'Failed to log custody event');
        }
        return response.json();
    },

    /**
     * Verify evidence integrity against blockchain
     */
    async verifyIntegrity(evidenceId: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('evidenceId', evidenceId);

        const response = await fetch(`${API_BASE_URL}/verify-blockchain`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Verification failed');
        }
        return response.json();
    },

    /**
     * Run AI Risk analysis
     */
    async analyzeRisk(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_BASE_URL}/ai/risk-score`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error('AI analysis failed');
        return response.json();
    },

    /**
     * Get chart data: Status distribution
     */
    async getAnalyticsStatus() {
        const response = await fetch(`${API_BASE_URL}/analytics/status`);
        if (!response.ok) throw new Error('Failed to fetch status analytics');
        return response.json();
    },

    /**
     * Get chart data: Upload trends
     */
    async getAnalyticsTrends() {
        const response = await fetch(`${API_BASE_URL}/analytics/trends`);
        if (!response.ok) throw new Error('Failed to fetch trend analytics');
        return response.json();
    },

    /**
     * Get chart data: Top collectors
     */
    async getAnalyticsCollectors() {
        const response = await fetch(`${API_BASE_URL}/analytics/collectors`);
        if (!response.ok) throw new Error('Failed to fetch collector analytics');
        return response.json();
    }
};
