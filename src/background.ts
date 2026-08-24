const MAILINATOR_API_BASE_URL = "https://www.mailinator.com/api/v2/domains/public";
const OTP_REGEX = /\b\d{6}\b/;
const OTP_POLL_ATTEMPTS = 4;
const OTP_POLL_DELAY_MS = 7000;
const INBOX_COOLDOWN_MS = 20000;

const inboxLastQueryAt = new Map<string, number>();

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
    const normalized = text.replace(/\s+/g, " ").trim();

    const sectionPattern =
        /email\s*verification[\s\S]{0,420}?(?:verification\s*code|enter\s*the\s*following)?[\s\S]{0,220}?(\b\d{6}\b)[\s\S]{0,260}?(?:expire|minutes|thank\s*you)/i;
    const sectionMatch = normalized.match(sectionPattern)?.[1];
    if (sectionMatch) {
        return sectionMatch;
    }

    const directMatch = normalized.match(OTP_REGEX);
    return directMatch?.[0] ?? null;
}

function extractOtpFromParts(parts: unknown): string | null {
    if (!Array.isArray(parts)) {
        return null;
    }

    const prioritized = [...parts].sort((a, b) => {
        const aType = ((a as MailPart)?.headers?.["content-type"] || "").toLowerCase();
        const bType = ((b as MailPart)?.headers?.["content-type"] || "").toLowerCase();

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
        const part = item as MailPart;
        if (typeof part.body !== "string" || part.body.trim().length === 0) {
            continue;
        }

        const encoding = (part.headers?.["content-transfer-encoding"] || "").toLowerCase();
        const text = encoding.includes("quoted-printable") ? decodeQuotedPrintable(part.body) : part.body;
        const otp = extractOtpFromVerificationText(text);
        if (otp) {
            return otp;
        }
    }

    return null;
}

async function fetchLatestOtpFromPublicApi(inbox: string): Promise<string | null> {
    const listUrl = `${MAILINATOR_API_BASE_URL}/inboxes/${encodeURIComponent(inbox)}?limit=10`;
    const listResponse = await fetch(listUrl, { method: "GET" });
    if (!listResponse.ok) {
        throw new Error(`No se pudo leer inbox (${listResponse.status})`);
    }

    const listPayload = await listResponse.json() as MailinatorListPayload;
    const messages = Array.isArray(listPayload.msgs)
        ? listPayload.msgs
        : Array.isArray(listPayload.messages)
            ? listPayload.messages
            : [];

    for (const item of messages) {
        const messageId = String(item.id || item.msgId || item._id || "").trim();
        if (!messageId || isTemplateLikeValue(messageId)) {
            continue;
        }

        const detailUrl = `${MAILINATOR_API_BASE_URL}/inboxes/${encodeURIComponent(inbox)}/messages/${encodeURIComponent(messageId)}`;
        const detailResponse = await fetch(detailUrl, { method: "GET" });
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
    const now = Date.now();
    const lastQueryAt = inboxLastQueryAt.get(inbox) ?? 0;
    if (now - lastQueryAt < INBOX_COOLDOWN_MS) {
        return null;
    }

    inboxLastQueryAt.set(inbox, now);

    for (let attempt = 1; attempt <= OTP_POLL_ATTEMPTS; attempt += 1) {
        const otp = await fetchLatestOtpFromPublicApi(inbox);
        if (otp) {
            return otp;
        }

        if (attempt < OTP_POLL_ATTEMPTS) {
            await sleep(OTP_POLL_DELAY_MS);
        }
    }

    return null;
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