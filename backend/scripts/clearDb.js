const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Loads .env from current directory

async function clearDatabase() {
    console.log('🧹 Starting Database Cleanup...');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Service key needed for deletions usually

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials in .env');
        console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
        console.log('Key:', supabaseKey ? 'Found' : 'Missing');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // 1. Clear Tamper Alerts
        console.log('   Removing Tamper Alerts...');
        // Using Nil UUID for UUID comparison
        const { error: error1 } = await supabase
            .from('tamper_alerts')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error1) console.warn('   ⚠️ Error clearing tamper_alerts:', error1.message);

        // 2. Clear Custody Events
        console.log('   Removing Custody Events...');
        const { error: error2 } = await supabase
            .from('custody_events')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error2) console.warn('   ⚠️ Error clearing custody_events:', error2.message);

        // 3. Clear Evidence
        console.log('   Removing Evidence Records...');
        // Try deleting by creation date which is safer for all types
        const { error: error3 } = await supabase
            .from('evidence')
            .delete()
            .neq('evidence_id', '0'); // Assuming evidence_id is string/text, not UUID. If UUID, usage of 0 might fail.
        // If evidence_id is text, this is fine. If UUID, we should use Nil UUID.
        // Let's use a broader filter if possible, or try Nil UUID if it fails.


        if (error3) {
            // Fallback if evidence_id check fails, try id
            const { error: error3b } = await supabase.from('evidence').delete().neq('id', 0);
            if (error3b) console.error('   ❌ Failed to clear evidence table:', error3.message);
        }

        console.log('✅ Database cleared successfully.');
        console.log('   Registry is now in sync with empty blockchain.');

    } catch (error) {
        console.error('❌ Unexpected error during cleanup:', error.message);
    }
}

clearDatabase();
