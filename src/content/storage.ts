import {
    AUTOFILL_PROFILE_STORAGE_PREFIX,
    AUTOFILL_PROFILE_TTL_MS,
    BUTTON_POSITION_STORAGE_PREFIX,
    INBOX_STORAGE_PREFIX,
    INBOX_STORAGE_TTL_MS,
    LAST_NAME_OVERRIDE_STORAGE_PREFIX,
    MAILINATOR_DOMAIN,
    Patterns,
    ZIP_SUGGESTIONS_ENABLED_STORAGE_PREFIX
} from "./profile";
import type { StoredAutofillProfile, StoredInboxState } from "./types";
import { normalizeHumanName } from "./utils";

const extensionStorageCache = new Map<string, string | null>();
let hostStorageInitialized = false;

function getHostScopedKey(prefix: string): string {
    return `${prefix}:${window.location.hostname.toLowerCase()}`;
}

function getHostScopedKeys(): string[] {
    return [
        getHostScopedKey(ZIP_SUGGESTIONS_ENABLED_STORAGE_PREFIX),
        getHostScopedKey(LAST_NAME_OVERRIDE_STORAGE_PREFIX),
        getHostScopedKey(AUTOFILL_PROFILE_STORAGE_PREFIX),
        getHostScopedKey(BUTTON_POSITION_STORAGE_PREFIX),
        getHostScopedKey(INBOX_STORAGE_PREFIX)
    ];
}

function getExtensionStorageLocal(): chrome.storage.StorageArea | null {
    const extensionChrome = (globalThis as typeof globalThis & {
        chrome?: {
            storage?: {
                local?: chrome.storage.StorageArea;
            };
        };
    }).chrome;

    return extensionChrome?.storage?.local ?? null;
}

function setExtensionStorageItems(items: Record<string, string>): Promise<void> {
    const storage = getExtensionStorageLocal();
    if (!storage) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        storage.set(items, () => resolve());
    });
}

function getExtensionStorageItems(keys: string[]): Promise<Record<string, unknown>> {
    const storage = getExtensionStorageLocal();
    if (!storage) {
        return Promise.resolve({});
    }

    return new Promise((resolve) => {
        storage.get(keys, (items) => {
            resolve(items as Record<string, unknown>);
        });
    });
}

function removeExtensionStorageKeys(keys: string[]): Promise<void> {
    const storage = getExtensionStorageLocal();
    if (!storage) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        storage.remove(keys, () => resolve());
    });
}

export async function initializeHostStorage(): Promise<void> {
    if (hostStorageInitialized) {
        return;
    }

    const keys = getHostScopedKeys();
    const existing = await getExtensionStorageItems(keys);
    const migrate: Record<string, string> = {};

    for (const key of keys) {
        const extensionValue = existing[key];
        if (typeof extensionValue === "string") {
            extensionStorageCache.set(key, extensionValue);
            localStorage.removeItem(key);
            continue;
        }

        const legacy = localStorage.getItem(key);
        if (legacy !== null) {
            extensionStorageCache.set(key, legacy);
            migrate[key] = legacy;
            localStorage.removeItem(key);
            continue;
        }

        extensionStorageCache.set(key, null);
    }

    const migrateKeys = Object.keys(migrate);
    if (migrateKeys.length > 0) {
        await setExtensionStorageItems(migrate);
    }

    hostStorageInitialized = true;
}

function writeScopedValue(key: string, value: string): void {
    extensionStorageCache.set(key, value);
    localStorage.removeItem(key);
    void setExtensionStorageItems({ [key]: value });
}

function removeScopedValue(key: string): void {
    extensionStorageCache.set(key, null);
    localStorage.removeItem(key);
    void removeExtensionStorageKeys([key]);
}

function readScopedValue(key: string): string | null {
    const cached = extensionStorageCache.get(key);
    if (cached !== undefined) {
        return cached;
    }

    const legacy = localStorage.getItem(key);
    if (legacy !== null) {
        writeScopedValue(key, legacy);
        return legacy;
    }

    return null;
}

export function isZipSuggestionsEnabled(): boolean {
    const raw = readScopedValue(getHostScopedKey(ZIP_SUGGESTIONS_ENABLED_STORAGE_PREFIX));
    if (raw === null) {
        return true;
    }

    return raw === "1";
}

export function setZipSuggestionsEnabled(enabled: boolean): void {
    writeScopedValue(getHostScopedKey(ZIP_SUGGESTIONS_ENABLED_STORAGE_PREFIX), enabled ? "1" : "0");
}

export function getConfiguredLastName(): string | null {
    const raw = readScopedValue(getHostScopedKey(LAST_NAME_OVERRIDE_STORAGE_PREFIX));
    if (!raw) {
        return null;
    }

    const candidate = normalizeHumanName(raw);
    if (!candidate || !Patterns.LastName.test(candidate)) {
        return null;
    }

    return candidate;
}

export function setConfiguredLastName(lastName: string | null): void {
    const key = getHostScopedKey(LAST_NAME_OVERRIDE_STORAGE_PREFIX);
    if (!lastName) {
        removeScopedValue(key);
        return;
    }

    writeScopedValue(key, lastName);
}

export function loadStoredAutofillProfile(): StoredAutofillProfile | null {
    try {
        const key = getHostScopedKey(AUTOFILL_PROFILE_STORAGE_PREFIX);
        const raw = readScopedValue(key);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as Partial<StoredAutofillProfile>;
        if (
            typeof parsed.firstName !== "string" ||
            typeof parsed.lastName !== "string" ||
            typeof parsed.email !== "string" ||
            typeof parsed.phone !== "string" ||
            typeof parsed.zipCode !== "string" ||
            typeof parsed.streetAddress !== "string" ||
            typeof parsed.updatedAt !== "number"
        ) {
            return null;
        }

        if (Date.now() - parsed.updatedAt > AUTOFILL_PROFILE_TTL_MS) {
            removeScopedValue(key);
            return null;
        }

        return {
            firstName: parsed.firstName,
            lastName: parsed.lastName,
            email: parsed.email,
            phone: parsed.phone,
            zipCode: parsed.zipCode,
            streetAddress: parsed.streetAddress,
            updatedAt: parsed.updatedAt
        };
    } catch {
        return null;
    }
}

export function persistAutofillProfile(profile: Omit<StoredAutofillProfile, "updatedAt">): void {
    const payload: StoredAutofillProfile = {
        ...profile,
        updatedAt: Date.now()
    };

    writeScopedValue(getHostScopedKey(AUTOFILL_PROFILE_STORAGE_PREFIX), JSON.stringify(payload));
}

export function saveButtonPosition(left: number, top: number): void {
    writeScopedValue(getHostScopedKey(BUTTON_POSITION_STORAGE_PREFIX), JSON.stringify({ left, top }));
}

export function loadButtonPosition(): { left: number; top: number } | null {
    try {
        const raw = readScopedValue(getHostScopedKey(BUTTON_POSITION_STORAGE_PREFIX));
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as { left?: number; top?: number };
        if (typeof parsed.left !== "number" || typeof parsed.top !== "number") {
            return null;
        }

        return { left: parsed.left, top: parsed.top };
    } catch {
        return null;
    }
}

export function loadStoredInbox(): StoredInboxState | null {
    try {
        const key = getHostScopedKey(INBOX_STORAGE_PREFIX);
        const raw = readScopedValue(key);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as Partial<StoredInboxState>;
        if (
            typeof parsed.inbox !== "string" ||
            typeof parsed.email !== "string" ||
            typeof parsed.updatedAt !== "number"
        ) {
            return null;
        }

        if (Date.now() - parsed.updatedAt > INBOX_STORAGE_TTL_MS) {
            removeScopedValue(key);
            return null;
        }

        return {
            inbox: parsed.inbox,
            email: parsed.email,
            updatedAt: parsed.updatedAt
        };
    } catch {
        return null;
    }
}

export function persistInbox(inbox: string): StoredInboxState {
    const state: StoredInboxState = {
        inbox,
        email: `${inbox}@${MAILINATOR_DOMAIN}`,
        updatedAt: Date.now()
    };

    writeScopedValue(getHostScopedKey(INBOX_STORAGE_PREFIX), JSON.stringify(state));
    return state;
}