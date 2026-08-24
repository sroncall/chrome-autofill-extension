import { faker } from "@faker-js/faker";
import { MAILINATOR_DOMAIN, Patterns } from "./profile";
import { loadStoredInbox, persistInbox } from "./storage";
import type { FillableElement, OtpResponseMessage, StoredInboxState } from "./types";

type ExtensionRuntimeLike = {
    sendMessage?: (
        message: { type: "mailinator:getLatestOtp"; inbox: string },
        callback?: (response: OtpResponseMessage | undefined) => void
    ) => void;
    lastError?: {
        message?: string;
    };
};

function getExtensionRuntime(): ExtensionRuntimeLike | undefined {
    const extensionChrome = (globalThis as typeof globalThis & {
        chrome?: {
            runtime?: ExtensionRuntimeLike;
        };
    }).chrome;

    return extensionChrome?.runtime;
}

export function hasExtensionRuntimeMessaging(): boolean {
    return Boolean(getExtensionRuntime()?.sendMessage);
}

export async function fetchLatestOtpFromMailinator(inbox: string): Promise<string | null> {
    const runtime = getExtensionRuntime();

    if (!runtime?.sendMessage) {
        return null;
    }

    const sendMessage = runtime.sendMessage;

    const response = await new Promise<OtpResponseMessage>((resolve, reject) => {
        sendMessage(
            {
                type: "mailinator:getLatestOtp",
                inbox
            },
            (result: OtpResponseMessage | undefined) => {
                const lastError = runtime.lastError;
                if (lastError) {
                    reject(new Error(lastError.message));
                    return;
                }

                if (!result) {
                    reject(new Error("No hubo respuesta del background"));
                    return;
                }

                resolve(result);
            }
        );
    });

    if (!response.ok) {
        throw new Error(response.error || "No se pudo obtener OTP");
    }

    return response.otp ?? null;
}

export function parseMailinatorInboxFromEmail(value: string): string | null {
    const normalized = value.trim().toLowerCase();
    const match = normalized.match(/^([a-z0-9._%+-]+)@mailinator\.com$/i);
    return match?.[1] ?? null;
}

export function sanitizeInboxToken(value: string): string {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 16);
}

function buildPatternSafeMailinatorEmail(firstName: string, lastName: string): StoredInboxState {
    for (let index = 0; index < 12; index += 1) {
        const localFirst = sanitizeInboxToken(firstName);
        const localLast = sanitizeInboxToken(lastName);
        const randomSuffix = faker.string.alphanumeric({ length: 4, casing: "lower" });
        const inbox = `${localFirst || "qa"}.${localLast || "user"}.${randomSuffix}`;
        const email = `${inbox}@${MAILINATOR_DOMAIN}`;

        if (Patterns.Email.test(email)) {
            return persistInbox(inbox);
        }
    }

    return persistInbox(`qa.user.${faker.string.alphanumeric({ length: 6, casing: "lower" })}`);
}

export function resolveMailinatorInbox(
    emailInput: FillableElement | null,
    firstName: string,
    lastName: string,
    forceGenerateNew: boolean
): StoredInboxState {
    if (forceGenerateNew) {
        return buildPatternSafeMailinatorEmail(firstName, lastName);
    }

    const existingEmail = emailInput?.value?.trim() ?? "";
    const existingInbox = parseMailinatorInboxFromEmail(existingEmail);
    if (existingInbox) {
        return persistInbox(existingInbox);
    }

    const stored = loadStoredInbox();
    if (stored) {
        return stored;
    }

    return buildPatternSafeMailinatorEmail(firstName, lastName);
}