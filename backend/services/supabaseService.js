const { createClient } = require('@supabase/supabase-js');

let supabase = null;

// Initialize Supabase Client
function initializeSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
        console.warn('⚠️ Supabase URL or Service Key missing. Database integration disabled.');
        return false;
    }

    try {
        supabase = createClient(url, key);
        console.log('✅ Supabase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error.message);
        return false;
    }
}

// Upload file to Supabase Storage
async function uploadFile(fileBuffer, fileName, mimeType) {
    if (!supabase) return { path: null, url: null, error: "Supabase not initialized" };

    try {
        const timestamp = Date.now();
        // Sanitize filename
        const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `evidence/${timestamp}-${cleanName}`;

        const { data, error } = await supabase.storage
            .from('evidence-files')
            .upload(path, fileBuffer, {
                contentType: mimeType,
                upsert: false
            });

        if (error) throw error;

        // Get public URL (or signed URL if bucket is private)
        // For private buckets, we usually generate signed URLs on demand,
        // but here we'll store the path and generate signed URLs when requested.

        return { path: data.path, error: null };
    } catch (error) {
        console.error('Upload Error:', error.message);
        return { path: null, url: null, error: error.message };
    }
}

// Get Signed URL for download
async function getFileUrl(path) {
    if (!supabase || !path) return null;

    try {
        const { data, error } = await supabase.storage
            .from('evidence-files')
            .createSignedUrl(path, 3600); // 1 hour expiry

        if (error) throw error;
        return data.signedUrl;
    } catch (error) {
        console.error('Get URL Error:', error.message);
        return null;
    }
}

// Save Evidence Metadata
async function saveEvidenceMetadata(evidenceData) {
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('evidence')
            .insert([evidenceData])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Save Metadata Error:', error.message);
        throw error;
    }
}

// Get All Evidence (with optional filters)
async function getEvidence(filters = {}) {
    if (!supabase) return [];

    try {
        let query = supabase
            .from('evidence')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters.search) {
            query = query.or(`evidence_id.ilike.%${filters.search}%,collected_by.ilike.%${filters.search}%,case_id.ilike.%${filters.search}%`);
        }

        if (filters.type && filters.type !== 'all' && filters.type !== 'All Types') {
            // Case-insensitive matching for evidence type
            query = query.ilike('evidence_type', filters.type);
        }

        // Remove status filter here as it requires derived logic (tamper alerts)
        // We will filter in server.js after aggregating data.

        const { data, error } = await query;
        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Get Evidence Error:', error.message);
        return [];
    }
}

// Get Evidence by ID
async function getEvidenceById(evidenceId) {
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('evidence')
            .select('*')
            .eq('evidence_id', evidenceId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Get Evidence By ID Error:', error.message);
        return null;
    }
}

// Save Custody Event
async function saveCustodyEvent(eventData) {
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('custody_events')
            .insert([eventData])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Save Custody Error:', error.message);
        // Don't throw, just log
        return null;
    }
}

// Save Tamper Alert
async function saveTamperAlert(alertData) {
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('tamper_alerts')
            .insert([alertData])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Save Alert Error:', error.message);
        return null;
    }
}

module.exports = {
    initializeSupabase,
    uploadFile,
    getFileUrl,
    saveEvidenceMetadata,
    getEvidence,
    getEvidenceById,
    saveCustodyEvent,
    saveTamperAlert
};
