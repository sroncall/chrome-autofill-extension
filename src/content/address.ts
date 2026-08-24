import { findAddressByZipCode, getKnownZipCodeSuggestions, getRandomKnownAddress } from "../addressBookByState";
import { Patterns, ZIP_SUGGESTIONS_ID } from "./profile";
import { isZipSuggestionsEnabled } from "./storage";
import type { PageProfile } from "./types";
import { queryFirstInput, setInputValue } from "./utils";

export function fillStreetAddressFromZipCode(profile: PageProfile): void {
    const zipInput = queryFirstInput(profile.zipCode);
    const streetInput = queryFirstInput(profile.streetAddress);

    if (!streetInput) {
        return;
    }

    const rawZip = zipInput?.value?.trim() ?? "";
    const knownByZip = findAddressByZipCode(rawZip);

    if (knownByZip && Patterns.AddressLine1.test(knownByZip.streetAddress)) {
        setInputValue(streetInput, knownByZip.streetAddress);
        return;
    }

    if (rawZip.length === 0) {
        const randomKnown = getRandomKnownAddress();
        if (!Patterns.AddressLine1.test(randomKnown.streetAddress)) {
            return;
        }

        if (zipInput) {
            setInputValue(zipInput, randomKnown.zipCode);
        }
        setInputValue(streetInput, randomKnown.streetAddress);
    }
}

export function attachZipCodeSuggestions(profile: PageProfile): void {
    const zipInput = queryFirstInput(profile.zipCode);
    if (!(zipInput instanceof HTMLInputElement)) {
        return;
    }

    if (zipInput.dataset.devbuddyZipSuggestAttached === "1") {
        return;
    }

    const allZipCodeSuggestions = getKnownZipCodeSuggestions();
    let popup = document.getElementById(ZIP_SUGGESTIONS_ID);
    if (!(popup instanceof HTMLDivElement)) {
        popup = document.createElement("div");
        popup.id = ZIP_SUGGESTIONS_ID;

        Object.assign(popup.style, {
            position: "fixed",
            zIndex: "2147483646",
            display: "none",
            maxHeight: "180px",
            overflowY: "auto",
            background: "#ffffff",
            border: "1px solid #d0d7de",
            borderRadius: "8px",
            boxShadow: "0 8px 18px rgba(0, 0, 0, 0.18)",
            fontFamily: "Arial, sans-serif",
            fontSize: "13px"
        });

        document.body.appendChild(popup);
    }

    const hidePopup = (): void => {
        if (popup instanceof HTMLDivElement) {
            popup.style.display = "none";
            popup.innerHTML = "";
        }
    };

    const positionPopup = (): void => {
        if (!(popup instanceof HTMLDivElement)) {
            return;
        }

        const rect = zipInput.getBoundingClientRect();
        popup.style.left = `${rect.left}px`;
        popup.style.top = `${rect.bottom + 4}px`;
        popup.style.width = `${Math.max(180, rect.width)}px`;
    };

    const renderPopup = (): void => {
        if (!(popup instanceof HTMLDivElement)) {
            return;
        }

        if (!isZipSuggestionsEnabled()) {
            hidePopup();
            return;
        }

        const raw = zipInput.value.replace(/\D/g, "");
        if (raw.length < 2) {
            hidePopup();
            return;
        }

        const candidates = allZipCodeSuggestions
            .filter((suggestion) => suggestion.zipCode.startsWith(raw))
            .slice(0, 10);

        if (candidates.length === 0) {
            hidePopup();
            return;
        }

        popup.innerHTML = "";
        for (const suggestion of candidates) {
            const option = document.createElement("button");
            option.type = "button";
            const statesLabel = suggestion.stateCodes.join("/");
            option.textContent = `${suggestion.zipCode} (${statesLabel})`;
            Object.assign(option.style, {
                all: "unset",
                boxSizing: "border-box",
                display: "block",
                width: "100%",
                padding: "8px 10px",
                cursor: "pointer",
                borderBottom: "1px solid #eef2f7"
            });

            option.addEventListener("mouseenter", () => {
                option.style.background = "#f3f8ff";
            });

            option.addEventListener("mouseleave", () => {
                option.style.background = "transparent";
            });

            option.addEventListener("mousedown", (event) => {
                event.preventDefault();
                zipInput.value = suggestion.zipCode;
                zipInput.dispatchEvent(new Event("input", { bubbles: true }));
                zipInput.dispatchEvent(new Event("change", { bubbles: true }));
                hidePopup();
            });

            popup.appendChild(option);
        }

        positionPopup();
        popup.style.display = "block";
    };

    zipInput.addEventListener("input", () => {
        const normalizedZip = zipInput.value.replace(/\D/g, "").slice(0, 5);
        renderPopup();

        if (normalizedZip.length !== 5) {
            return;
        }

        const known = findAddressByZipCode(normalizedZip);
        if (!known) {
            return;
        }

        const streetInput = queryFirstInput(profile.streetAddress);
        if (!streetInput || streetInput.value.trim()) {
            return;
        }

        setInputValue(streetInput, known.streetAddress);
    });

    zipInput.addEventListener("focus", renderPopup);
    zipInput.addEventListener("blur", () => {
        setTimeout(hidePopup, 120);
    });

    window.addEventListener("resize", () => {
        if (popup instanceof HTMLDivElement && popup.style.display === "block") {
            positionPopup();
        }
    });

    window.addEventListener("scroll", () => {
        if (popup instanceof HTMLDivElement && popup.style.display === "block") {
            positionPopup();
        }
    }, true);

    zipInput.dataset.devbuddyZipSuggestAttached = "1";
}