import {
    AUTOFILL_BUTTON_DEFAULT_LABEL,
    BUTTON_ID,
    Patterns,
    ZIP_SUGGESTIONS_ID
} from "./profile";
import {
    getConfiguredLastName,
    isZipSuggestionsEnabled,
    loadButtonPosition,
    saveButtonPosition,
    setConfiguredLastName,
    setZipSuggestionsEnabled
} from "./storage";
import { normalizeHumanName } from "./utils";

const LATEST_RELEASE_API_URL = "https://api.github.com/repos/sroncall/chrome-autofill-extension/releases/latest";
const LATEST_RELEASE_DOWNLOAD_URL = "https://github.com/sroncall/chrome-autofill-extension/releases/latest/download/autofill-otp-chrome-latest.zip";

type LatestReleasePayload = {
    tag_name?: string;
};

function parseSemver(value: string): [number, number, number] | null {
    const cleaned = value.trim().replace(/^v/i, "");
    const match = cleaned.match(/^(\d+)\.(\d+)\.(\d+)/);
    if (!match) {
        return null;
    }

    const major = Number.parseInt(match[1], 10);
    const minor = Number.parseInt(match[2], 10);
    const patch = Number.parseInt(match[3], 10);

    if (Number.isNaN(major) || Number.isNaN(minor) || Number.isNaN(patch)) {
        return null;
    }

    return [major, minor, patch];
}

function compareSemver(a: string, b: string): number {
    const parsedA = parseSemver(a);
    const parsedB = parseSemver(b);

    if (!parsedA || !parsedB) {
        return 0;
    }

    for (let index = 0; index < 3; index += 1) {
        if (parsedA[index] > parsedB[index]) {
            return 1;
        }

        if (parsedA[index] < parsedB[index]) {
            return -1;
        }
    }

    return 0;
}

async function fetchLatestReleaseTag(): Promise<string | null> {
    try {
        const response = await fetch(LATEST_RELEASE_API_URL, {
            method: "GET",
            headers: {
                Accept: "application/vnd.github+json"
            }
        });

        if (!response.ok) {
            return null;
        }

        const payload = await response.json() as LatestReleasePayload;
        if (!payload.tag_name || payload.tag_name.trim().length === 0) {
            return null;
        }

        return payload.tag_name.trim();
    } catch {
        return null;
    }
}

function clampButtonToViewport(button: HTMLButtonElement, left: number, top: number): { left: number; top: number } {
    const margin = 8;
    const maxLeft = Math.max(margin, window.innerWidth - button.offsetWidth - margin);
    const maxTop = Math.max(margin, window.innerHeight - button.offsetHeight - margin);

    return {
        left: Math.min(Math.max(margin, left), maxLeft),
        top: Math.min(Math.max(margin, top), maxTop)
    };
}

function applyButtonPosition(button: HTMLButtonElement, left: number, top: number): void {
    const clamped = clampButtonToViewport(button, left, top);
    button.style.left = `${clamped.left}px`;
    button.style.top = `${clamped.top}px`;
    button.style.right = "auto";
    button.style.bottom = "auto";
}

function attachButtonDragBehavior(button: HTMLButtonElement): void {
    let isDragging = false;
    let movedDuringDrag = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    button.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) {
            return;
        }

        const rect = button.getBoundingClientRect();
        isDragging = true;
        movedDuringDrag = false;
        dragOffsetX = event.clientX - rect.left;
        dragOffsetY = event.clientY - rect.top;

        button.setPointerCapture(event.pointerId);
        button.style.cursor = "grabbing";
        event.preventDefault();
    });

    button.addEventListener("pointermove", (event) => {
        if (!isDragging) {
            return;
        }

        const nextLeft = event.clientX - dragOffsetX;
        const nextTop = event.clientY - dragOffsetY;
        const currentLeft = parseFloat(button.style.left || "0");
        const currentTop = parseFloat(button.style.top || "0");

        if (Math.abs(nextLeft - currentLeft) > 2 || Math.abs(nextTop - currentTop) > 2) {
            movedDuringDrag = true;
        }

        applyButtonPosition(button, nextLeft, nextTop);
    });

    button.addEventListener("pointerup", (event) => {
        if (!isDragging) {
            return;
        }

        isDragging = false;
        button.style.cursor = "grab";

        const rect = button.getBoundingClientRect();
        saveButtonPosition(rect.left, rect.top);

        if (movedDuringDrag) {
            button.dataset.devbuddySkipClick = "1";
            setTimeout(() => {
                if (button.dataset.devbuddySkipClick === "1") {
                    button.dataset.devbuddySkipClick = "0";
                }
            }, 0);
        }

        button.releasePointerCapture(event.pointerId);
    });
}

type CreateAutofillButtonOptions = {
    onAutofillClick: (button: HTMLButtonElement) => Promise<void>;
};

export function createAutofillButton({ onAutofillClick }: CreateAutofillButtonOptions): HTMLButtonElement {
    const button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
    button.textContent = AUTOFILL_BUTTON_DEFAULT_LABEL;

    let statusTimer: number | null = null;
    let autofillInProgress = false;
    let latestVersionLabel: string | null = null;
    const helpTooltip = document.createElement("div");
    const updateLink = document.createElement("a");

    const updateHelpTooltipText = (): void => {
        const configuredLastName = getConfiguredLastName();
        const lines = [
            "Click: autocompletar",
            "Shift+Click: editar lastName fijo",
            "Click derecho: ZIP ON/OFF"
        ];

        if (configuredLastName) {
            lines.push(`lastName activo: ${configuredLastName}`);
        }

        if (latestVersionLabel) {
            lines.push(`Nueva version: ${latestVersionLabel}`);
        }

        helpTooltip.textContent = lines.join("\n");
    };

    updateHelpTooltipText();

    Object.assign(helpTooltip.style, {
        position: "fixed",
        zIndex: "2147483647",
        maxWidth: "340px",
        padding: "8px 10px",
        borderRadius: "8px",
        background: "rgba(17, 24, 39, 0.95)",
        color: "#f9fafb",
        fontSize: "12px",
        lineHeight: "1.35",
        boxShadow: "0 8px 18px rgba(0, 0, 0, 0.28)",
        pointerEvents: "none",
        opacity: "0",
        transform: "translateY(4px)",
        transition: "opacity 120ms ease, transform 120ms ease",
        whiteSpace: "pre-line",
        display: "none"
    });

    Object.assign(button.style, {
        position: "fixed",
        right: "20px",
        bottom: "20px",
        zIndex: "2147483647",
        border: "none",
        borderRadius: "9999px",
        padding: "9px 14px",
        background: "linear-gradient(135deg, #0f766e, #0891b2)",
        color: "#ffffff",
        fontSize: "13px",
        fontWeight: "700",
        cursor: "grab",
        touchAction: "none",
        userSelect: "none",
        boxShadow: "0 8px 18px rgba(0, 0, 0, 0.28)"
    });

    updateLink.href = LATEST_RELEASE_DOWNLOAD_URL;
    updateLink.target = "_blank";
    updateLink.rel = "noopener noreferrer";
    updateLink.textContent = "Update disponible";

    Object.assign(updateLink.style, {
        position: "fixed",
        zIndex: "2147483647",
        display: "none",
        padding: "6px 10px",
        borderRadius: "9999px",
        textDecoration: "none",
        background: "#f59e0b",
        color: "#111827",
        fontSize: "12px",
        fontWeight: "700",
        boxShadow: "0 6px 14px rgba(0, 0, 0, 0.22)"
    });

    const savedPosition = loadButtonPosition();
    if (savedPosition) {
        applyButtonPosition(button, savedPosition.left, savedPosition.top);
    }

    attachButtonDragBehavior(button);

    const positionHelpTooltip = (): void => {
        const rect = button.getBoundingClientRect();
        const margin = 10;
        const top = Math.max(8, rect.bottom + margin);
        const left = Math.max(8, Math.min(window.innerWidth - 348, rect.left));
        helpTooltip.style.top = `${top}px`;
        helpTooltip.style.left = `${left}px`;
    };

    const positionUpdateLink = (): void => {
        const rect = button.getBoundingClientRect();
        const left = Math.max(8, Math.min(window.innerWidth - 180, rect.left));
        const top = Math.max(8, rect.top - 36);
        updateLink.style.left = `${left}px`;
        updateLink.style.top = `${top}px`;
    };

    const showHelpTooltip = (): void => {
        updateHelpTooltipText();
        positionHelpTooltip();
        helpTooltip.style.display = "block";
        requestAnimationFrame(() => {
            helpTooltip.style.opacity = "1";
            helpTooltip.style.transform = "translateY(0)";
        });
    };

    const hideHelpTooltip = (): void => {
        helpTooltip.style.opacity = "0";
        helpTooltip.style.transform = "translateY(4px)";
        window.setTimeout(() => {
            if (helpTooltip.style.opacity === "0") {
                helpTooltip.style.display = "none";
            }
        }, 130);
    };

    button.addEventListener("mouseenter", () => {
        button.style.transform = "translateY(-1px)";
        button.style.boxShadow = "0 10px 22px rgba(0, 0, 0, 0.32)";
        showHelpTooltip();
    });

    button.addEventListener("mouseleave", () => {
        button.style.transform = "translateY(0)";
        button.style.boxShadow = "0 8px 18px rgba(0, 0, 0, 0.28)";
        hideHelpTooltip();
    });

    button.addEventListener("pointerdown", hideHelpTooltip);

    window.addEventListener("resize", () => {
        if (helpTooltip.style.display === "block") {
            positionHelpTooltip();
        }

        if (updateLink.style.display === "block") {
            positionUpdateLink();
        }
    });

    window.addEventListener("scroll", () => {
        if (helpTooltip.style.display === "block") {
            positionHelpTooltip();
        }

        if (updateLink.style.display === "block") {
            positionUpdateLink();
        }
    }, true);

    button.addEventListener("pointermove", () => {
        if (updateLink.style.display === "block") {
            positionUpdateLink();
        }
    });

    button.addEventListener("click", (event) => {
        if (button.dataset.devbuddySkipClick === "1") {
            return;
        }

        if (event.shiftKey) {
            const current = getConfiguredLastName();
            const input = window.prompt(
                "Apellido fijo para Autocomplete (solo lastName).\nDeja vacio para volver a aleatorio:",
                current ?? ""
            );

            if (input === null) {
                return;
            }

            const normalized = normalizeHumanName(input);
            if (!normalized) {
                setConfiguredLastName(null);
                updateHelpTooltipText();
                button.textContent = "Apellido: aleatorio";
                if (statusTimer !== null) {
                    window.clearTimeout(statusTimer);
                }
                statusTimer = window.setTimeout(() => {
                    button.textContent = AUTOFILL_BUTTON_DEFAULT_LABEL;
                    statusTimer = null;
                }, 1400);
                return;
            }

            if (!Patterns.LastName.test(normalized)) {
                button.textContent = "Apellido invalido";
                if (statusTimer !== null) {
                    window.clearTimeout(statusTimer);
                }
                statusTimer = window.setTimeout(() => {
                    button.textContent = AUTOFILL_BUTTON_DEFAULT_LABEL;
                    statusTimer = null;
                }, 1400);
                return;
            }

            setConfiguredLastName(normalized);
            updateHelpTooltipText();
            button.textContent = `Apellido: ${normalized}`;
            if (statusTimer !== null) {
                window.clearTimeout(statusTimer);
            }
            statusTimer = window.setTimeout(() => {
                button.textContent = AUTOFILL_BUTTON_DEFAULT_LABEL;
                statusTimer = null;
            }, 1400);
            return;
        }

        if (autofillInProgress) {
            return;
        }

        if (statusTimer !== null) {
            window.clearTimeout(statusTimer);
            statusTimer = null;
        }

        autofillInProgress = true;
        button.disabled = true;
        void onAutofillClick(button)
            .catch((error) => {
                console.error("Error en autofill", error);
            })
            .finally(() => {
                autofillInProgress = false;
                button.disabled = false;
            });
    });

    button.addEventListener("contextmenu", (event) => {
        event.preventDefault();

        if (button.disabled) {
            return;
        }

        if (statusTimer !== null) {
            window.clearTimeout(statusTimer);
            statusTimer = null;
        }

        const nextEnabled = !isZipSuggestionsEnabled();
        setZipSuggestionsEnabled(nextEnabled);
        updateHelpTooltipText();

        button.textContent = nextEnabled ? "Sugerencias ZIP: ON" : "Sugerencias ZIP: OFF";

        const popup = document.getElementById(ZIP_SUGGESTIONS_ID);
        if (popup instanceof HTMLDivElement && !nextEnabled) {
            popup.style.display = "none";
            popup.innerHTML = "";
        }

        statusTimer = window.setTimeout(() => {
            button.textContent = AUTOFILL_BUTTON_DEFAULT_LABEL;
            statusTimer = null;
        }, 1200);
    });

    document.body.appendChild(helpTooltip);
    document.body.appendChild(updateLink);

    const installedVersion = (globalThis as typeof globalThis & {
        chrome?: {
            runtime?: {
                getManifest?: () => { version?: string };
            };
        };
    }).chrome?.runtime?.getManifest?.().version;

    if (installedVersion) {
        void fetchLatestReleaseTag().then((latestTag) => {
            if (!latestTag) {
                return;
            }

            if (compareSemver(latestTag, installedVersion) <= 0) {
                return;
            }

            latestVersionLabel = latestTag;
            updateHelpTooltipText();
            updateLink.textContent = `Update ${latestTag}`;
            updateLink.style.display = "block";
            positionUpdateLink();
        });
    }

    return button;
}