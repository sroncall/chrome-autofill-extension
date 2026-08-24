import { faker } from "@faker-js/faker";
import { Patterns } from "./profile";
import type { FillableElement, SelectorList } from "./types";

export function queryFirstInput(selectors: SelectorList): FillableElement | null {
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            return element;
        }
    }

    return null;
}

export function queryAllInputs(selectors: SelectorList): FillableElement[] {
    const seen = new Set<FillableElement>();

    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
            if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                seen.add(element);
            }
        }
    }

    return [...seen];
}

export function queryFirstSelect(selectors: SelectorList): HTMLSelectElement | null {
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element instanceof HTMLSelectElement) {
            return element;
        }
    }

    return null;
}

export function setInputValue(input: FillableElement | null, value: string): void {
    if (!input) {
        return;
    }

    input.focus();
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
}

export function setSelectValueByTextOrValue(select: HTMLSelectElement | null, target: string): boolean {
    if (!select || select.disabled) {
        return false;
    }

    const normalizedTarget = target.trim().toLowerCase();
    const options = [...select.options];
    const matchingOption = options.find((option) => {
        const value = option.value.trim().toLowerCase();
        const text = option.textContent?.trim().toLowerCase() ?? "";
        return value === normalizedTarget || text === normalizedTarget;
    });

    if (!matchingOption) {
        return false;
    }

    select.focus();
    select.value = matchingOption.value;
    matchingOption.selected = true;
    select.dispatchEvent(new Event("input", { bubbles: true }));
    select.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
}

function isCaptchaLikeInput(input: HTMLInputElement): boolean {
    const fingerprint = [
        input.id,
        input.name,
        input.className,
        input.getAttribute("aria-label") || "",
        input.getAttribute("data-sitekey") || "",
        input.closest("[class*='captcha'], [id*='captcha']")?.getAttribute("class") || ""
    ]
        .join(" ")
        .toLowerCase();

    return fingerprint.includes("captcha") || fingerprint.includes("recaptcha") || fingerprint.includes("hcaptcha");
}

function forceCheckInput(input: HTMLInputElement): void {
    if (input.checked || input.disabled) {
        return;
    }

    input.focus();
    input.click();

    if (!input.checked) {
        input.checked = true;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
    }
}

export function fillRequiredChoiceInputs(): void {
    const requiredCheckboxes = document.querySelectorAll<HTMLInputElement>(
        "input[type='checkbox'][required], input[type='checkbox'][aria-required='true'], .checkbox-field.standalone input[type='checkbox']"
    );

    for (const checkbox of requiredCheckboxes) {
        if (isCaptchaLikeInput(checkbox)) {
            continue;
        }

        forceCheckInput(checkbox);
    }

    const requiredRadios = document.querySelectorAll<HTMLInputElement>(
        "input[type='radio'][required], input[type='radio'][aria-required='true']"
    );
    const radioGroups = new Map<string, HTMLInputElement[]>();

    for (const radio of requiredRadios) {
        if (isCaptchaLikeInput(radio) || radio.disabled) {
            continue;
        }

        const groupKey = `${radio.form?.id || "no-form"}::${radio.name || radio.id || "unnamed"}`;
        const existing = radioGroups.get(groupKey);
        if (existing) {
            existing.push(radio);
        } else {
            radioGroups.set(groupKey, [radio]);
        }
    }

    for (const radios of radioGroups.values()) {
        if (radios.some((radio) => radio.checked)) {
            continue;
        }

        const candidate = radios.find((radio) => !radio.disabled);
        if (candidate) {
            forceCheckInput(candidate);
        }
    }
}

export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

function dateFormatUs(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

function dateFormatIso(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

export function formatDobForInput(input: FillableElement | null, date: Date): string {
    if (input instanceof HTMLInputElement && input.type === "date") {
        return dateFormatIso(date);
    }

    return dateFormatUs(date);
}

export function normalizeHumanName(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Za-z\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function generatePatternSafeFirstName(): string {
    for (let index = 0; index < 12; index += 1) {
        const candidate = normalizeHumanName(faker.person.firstName());
        if (candidate && Patterns.FirstName.test(candidate)) {
            return candidate;
        }
    }

    return "John";
}

export function generatePatternSafeLastName(): string {
    for (let index = 0; index < 12; index += 1) {
        const candidate = normalizeHumanName(faker.person.lastName());
        if (candidate && Patterns.LastName.test(candidate)) {
            return candidate;
        }
    }

    return "Smith";
}

export function buildInitials(firstName: string, lastName: string): string {
    const first = normalizeHumanName(firstName).split(" ").find(Boolean) ?? "";
    const last = normalizeHumanName(lastName).split(" ").find(Boolean) ?? "";
    return `${first.charAt(0)}${last.charAt(0)}`.toLowerCase();
}

export function generateUsPhoneNumber(): string {
    const buildNxx = (): string => {
        const first = String(faker.number.int({ min: 2, max: 9 }));
        const second = String(faker.number.int({ min: 0, max: 9 }));
        const third = String(faker.number.int({ min: 0, max: 9 }));

        if (second === "1" && third === "1") {
            return buildNxx();
        }

        return `${first}${second}${third}`;
    };

    for (let index = 0; index < 12; index += 1) {
        const areaCode = buildNxx();
        const exchange = buildNxx();
        const line = String(faker.number.int({ min: 0, max: 9999 })).padStart(4, "0");
        const candidate = `${areaCode}${exchange}${line}`;

        if (Patterns.Phone.test(candidate)) {
            return candidate;
        }
    }

    return "2125551234";
}