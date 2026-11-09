import type { StoredAutofillProfile } from "./types";

const FLOW_STORAGE_KEY = "devbuddy.activeFlow";
const FLOW_TTL_MS = 30 * 60 * 1000;

export type AutofillFlow = {
    startStep: string;
    profile: StoredAutofillProfile;
};

export function shouldReuseFlow(flow: AutofillFlow | null, step: string, hasOtp: boolean): boolean {
    return Boolean(flow && Date.now() - flow.profile.updatedAt < FLOW_TTL_MS &&
        (hasOtp || flow.startStep !== step));
}

export function loadAutofillFlow(): AutofillFlow | null {
    try {
        const raw = sessionStorage.getItem(FLOW_STORAGE_KEY);
        if (!raw) {
            return null;
        }
        const flow = JSON.parse(raw) as AutofillFlow;
        if (typeof flow.startStep !== "string" || !flow.profile ||
            ![flow.profile.firstName, flow.profile.lastName, flow.profile.email, flow.profile.phone,
                flow.profile.zipCode, flow.profile.streetAddress].every((value) => typeof value === "string") ||
            typeof flow.profile.updatedAt !== "number" ||
            Date.now() - flow.profile.updatedAt >= FLOW_TTL_MS) {
            sessionStorage.removeItem(FLOW_STORAGE_KEY);
            return null;
        }
        return flow;
    } catch {
        return null;
    }
}

export function persistAutofillFlow(startStep: string, profile: Omit<StoredAutofillProfile, "updatedAt">): void {
    try {
        sessionStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify({
            startStep,
            profile: { ...profile, updatedAt: Date.now() }
        }));
    } catch {
        // Autofill remains available when the page blocks session storage.
    }
}