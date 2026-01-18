/**
 * Policy Engine - Validates custody actions against policies
 * ITEM #3: Minimal enforcement + on-chain violation record
 */

// Sample policy for demonstration
const defaultPolicy = {
    allowedRoles: ['COLLECTOR', 'FORENSIC_ANALYST', 'DETECTIVE', 'COURT_CLERK'],
    requiredOrder: ['COLLECTED', 'SEALED', 'ANALYZED', 'VERIFIED'],
    allowedSkips: [],
    maxAccessDurationHours: 48,
    noParallelAccess: true
};

// In-memory state for demo (would be database in production)
const activeCheckouts = new Map(); // evidenceId -> {handler, since}
const custodyState = new Map(); // evidenceId -> currentStep

class PolicyEngine {
    /**
     * Validate custody action against policy
     */
    async validateCustodyAction(evidenceId, action, handler, details) {
        const policy = defaultPolicy; // In production, load from database

        // 1. Validate role (simplified - handler.role would come from auth)
        // For demo, we allow all actions

        // 2. Validate custody order
        const currentStep = custodyState.get(evidenceId) || 'NONE';
        if (currentStep !== 'NONE') {
            const orderValid = this._validateOrder(currentStep, action, policy);
            if (!orderValid.valid) {
                return {
                    valid: false,
                    violation: 'INVALID_CUSTODY_ORDER',
                    details: orderValid.reason
                };
            }
        }

        // 3. Check parallel access
        if (policy.noParallelAccess && action !== 'COLLECTED') {
            const checkout = activeCheckouts.get(evidenceId);
            if (checkout && checkout.handler !== handler) {
                return {
                    valid: false,
                    violation: 'PARALLEL_ACCESS_VIOLATION',
                    details: `Evidence currently held by ${checkout.handler}`
                };
            }
        }

        // 4. Check access duration
        const checkout = activeCheckouts.get(evidenceId);
        if (checkout) {
            const hoursHeld = (Date.now() - checkout.since) / (1000 * 60 * 60);
            if (hoursHeld > policy.maxAccessDurationHours) {
                return {
                    valid: false,
                    violation: 'ACCESS_DURATION_EXCEEDED',
                    details: `Max duration ${policy.maxAccessDurationHours}h exceeded (held ${hoursHeld.toFixed(1)}h)`
                };
            }
        }

        // All validations passed
        // Update state
        custodyState.set(evidenceId, action);
        if (action === 'ACCESSED' || action === 'TRANSFERRED') {
            activeCheckouts.set(evidenceId, { handler, since: Date.now() });
        }

        return { valid: true };
    }

    /**
     * Validate custody order
     */
    _validateOrder(currentStep, nextAction, policy) {
        const order = policy.requiredOrder;
        const currentIndex = order.indexOf(currentStep);
        const nextIndex = order.indexOf(nextAction);

        // Allow same step again (e.g., ACCESSED multiple times)
        if (currentStep === nextAction) {
            return { valid: true };
        }

        // If next action not in required order, it's an ad-hoc action (allowed)
        if (nextIndex === -1) {
            return { valid: true };
        }

        // Check if we're skipping required steps
        if (nextIndex > currentIndex + 1) {
            const skipped = order.slice(currentIndex + 1, nextIndex);
            const invalidSkips = skipped.filter(s => !policy.allowedSkips.includes(s));

            if (invalidSkips.length > 0) {
                return {
                    valid: false,
                    reason: `Cannot skip required steps: ${invalidSkips.join(', ')}`
                };
            }
        }

        // Check backward movement
        if (nextIndex < currentIndex && nextIndex !== -1) {
            return {
                valid: false,
                reason: 'Cannot move backward in custody chain'
            };
        }

        return { valid: true };
    }

    /**
     * Release evidence checkout
     */
    releaseCheckout(evidenceId) {
        activeCheckouts.delete(evidenceId);
    }
}

module.exports = new PolicyEngine();
