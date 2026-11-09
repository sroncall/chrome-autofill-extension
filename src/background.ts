const MAILINATOR_API_BASE_URL = "https://www.mailinator.com/api/v2/domains/public";
const OTP_REGEX = /\b\d{4,8}\b/;
const OTP_POLL_ATTEMPTS = 8;
const OTP_POLL_DELAY_MS = 5000;

const inboxRequests = new Map<string, Promise<string | null>>();

type OtpRequestMessage = {
    type: "mailinator:getLatestOtp";
    inbox: string;
};

type OtpResponseMessage = {
    ok: boolean;
    otp?: string | null;
    error?: string;
};

type MailinatorApiMessage = {
    id?: string;
    msgId?: string;
    _id?: string;
    time?: number;
    received?: number;
};

type MailinatorListPayload = {
    msgs?: MailinatorApiMessage[];
    messages?: MailinatorApiMessage[];
};

type MailPart = {
    body?: string;
    headers?: Record<string, string>;
};

type MailDetailPayload = {
    parts?: MailPart[];
};

function isTemplateLikeValue(value: string): boolean {
    return /\{\{.*\}\}|email\.id|\$\{.*\}/i.test(value);
}

function decodeQuotedPrintable(input: string): string {
    const unfolded = input.replace(/=(\r?\n)/g, "");

    return unfolded.replace(/=([0-9A-F]{2})/gi, (_full, hex: string) => {
        const code = Number.parseInt(hex, 16);
        return Number.isNaN(code) ? "" : String.fromCharCode(code);
    });
}

function extractOtpFromVerificationText(text: string): string | null {
    const normalized = text
        .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&#(x[0-9a-f]+|\d+);/gi, (_match, code: string) => {
            const value = code[0].toLowerCase() === "x"
                ? Number.parseInt(code.slice(1), 16) : Number.parseInt(code, 10);
            return value <= 0x10ffff ? String.fromCodePoint(value) : " ";
        })
        .replace(/&(?:nbsp|amp|quot|lt|gt);/gi, " ")
        .replace(/\s+/g, " ").trim();

    const contextualPattern =
        /(?:(?:verification|confirmation|security|one[ -]?time)\s+(?:code|number|password)|(?:c[oó]digo|pin)(?:\s+de\s+(?:verificaci[oó]n|validaci[oó]n|confirmaci[oó]n|seguridad))?|\botp\b|\bpin\b)[\s\S]{0,180}?(\b\d{3,4}[ -]\d{3,4}\b|\b\d{4,8}\b)/i;
    const contextualMatch = normalized.match(contextualPattern)?.[1];
    if (contextualMatch) {
        return contextualMatch.replace(/[ -]/g, "");
    }

    const sectionPattern =
        /email\s*verification[\s\S]{0,420}?(?:verification\s*code|enter\s*the\s*following)?[\s\S]{0,220}?(\b\d{4,8}\b)[\s\S]{0,260}?(?:expire|minutes|thank\s*you)/i;
    const sectionMatch = normalized.match(sectionPattern)?.[1];
    if (sectionMatch) {
        return sectionMatch;
    }

    const directMatch = normalized.match(OTP_REGEX);
    return directMatch?.[0] ?? null;
}

function getMailHeader(part: MailPart, name: string): string {
    return Object.entries(part.headers ?? {})
        .find(([key]) => key.toLowerCase() === name)?.[1]?.toLowerCase() ?? "";
}

function extractOtpFromParts(parts: unknown): string | null {
    if (!Array.isArray(parts)) {
        return null;
    }

    const prioritized = [...parts].sort((a, b) => {
        const aType = getMailHeader((a ?? {}) as MailPart, "content-type");
        const bType = getMailHeader((b ?? {}) as MailPart, "content-type");

        const rank = (contentType: string): number => {
            if (contentType.includes("text/plain")) {
                return 0;
            }
            if (contentType.includes("text/html")) {
                return 1;
            }
            return 2;
        };

        return rank(aType) - rank(bType);
    });

    for (const item of prioritized) {
        const part = (item ?? {}) as MailPart;
        if (typeof part.body !== "string" || part.body.trim().length === 0) {
            continue;
        }

        const encoding = getMailHeader(part, "content-transfer-encoding");
        let text = part.body;
        try {
            if (encoding.includes("quoted-printable")) {
                text = decodeQuotedPrintable(text);
            } else if (encoding.includes("base64")) {
                text = new TextDecoder().decode(Uint8Array.from(atob(text.replace(/\s/g, "")),
                    (character) => character.charCodeAt(0)));
            }
        } catch {
            continue;
        }
        const otp = extractOtpFromVerificationText(text);
        if (otp) {
            return otp;
        }
    }

    return null;
}

async function fetchLatestOtpFromPublicApi(inbox: string): Promise<string | null> {
    const listUrl = `${MAILINATOR_API_BASE_URL}/inboxes/${encodeURIComponent(inbox)}?limit=10`;
    const listResponse = await fetch(listUrl, {
        method: "GET", cache: "no-store", signal: AbortSignal.timeout(10000)
    });
    if (!listResponse.ok) {
        throw new Error(`No se pudo leer inbox (${listResponse.status})`);
    }

    const listPayload = await listResponse.json() as MailinatorListPayload;
    const messages = Array.isArray(listPayload.msgs)
        ? listPayload.msgs
        : Array.isArray(listPayload.messages)
            ? listPayload.messages
            : [];

    const newestFirst = [...messages].sort((a, b) => (b.time ?? b.received ?? 0) - (a.time ?? a.received ?? 0));
    for (const item of newestFirst) {
        const messageId = String(item.id || item.msgId || item._id || "").trim();
        if (!messageId || isTemplateLikeValue(messageId)) {
            continue;
        }

        const detailUrl = `${MAILINATOR_API_BASE_URL}/inboxes/${encodeURIComponent(inbox)}/messages/${encodeURIComponent(messageId)}`;
        const detailResponse = await fetch(detailUrl, {
            method: "GET", cache: "no-store", signal: AbortSignal.timeout(10000)
        });
        if (!detailResponse.ok) {
            continue;
        }

        const detailPayload = await detailResponse.json() as MailDetailPayload;
        const otp = extractOtpFromParts(detailPayload.parts);
        if (otp) {
            return otp;
        }
    }

    return null;
}

async function sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchLatestOtpFromMailinator(inbox: string): Promise<string | null> {
    const normalizedInbox = inbox.trim().toLowerCase();
    if (!/^[a-z0-9._%+-]+$/.test(normalizedInbox)) {
        throw new Error("Inbox Mailinator invalido");
    }
    const existing = inboxRequests.get(normalizedInbox);
    if (existing) {
        return existing;
    }

    const request = (async () => {
        for (let attempt = 1; attempt <= OTP_POLL_ATTEMPTS; attempt += 1) {
            try {
                const otp = await fetchLatestOtpFromPublicApi(normalizedInbox);
                if (otp) {
                    return otp;
                }
            } catch (error) {
                // Transient HTTP/network failures must not cancel the whole lookup.
                if (attempt === OTP_POLL_ATTEMPTS) {
                    throw error;
                }
            }
            if (attempt < OTP_POLL_ATTEMPTS) {
                await sleep(OTP_POLL_DELAY_MS);
            }
        }
        return null;
    })();
    inboxRequests.set(normalizedInbox, request);
    try {
        return await request;
    } finally {
        inboxRequests.delete(normalizedInbox);
    }
}

const extensionChrome = (globalThis as any).chrome;

extensionChrome.runtime.onMessage.addListener(
    (message: OtpRequestMessage, _sender: unknown, sendResponse: (response: OtpResponseMessage) => void) => {
        if (!message || message.type !== "mailinator:getLatestOtp") {
            return false;
        }

        void (async () => {
            try {
                const otp = await fetchLatestOtpFromMailinator(message.inbox);
                sendResponse({ ok: true, otp });
            } catch (error) {
                const reason = error instanceof Error ? error.message : "Error desconocido";
                sendResponse({ ok: false, error: reason });
            }
        })();

        return true;
    }
);