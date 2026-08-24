import { attachZipCodeSuggestions } from "./content/address";
import { handleAutofillClick } from "./content/autofill";
import { createAutofillButton } from "./content/button";
import { BUTTON_ID, getProfileForCurrentPage } from "./content/profile";
import { initializeHostStorage } from "./content/storage";

function shouldEnableForCurrentHost(hostname: string): boolean {
    const host = hostname.toLowerCase();

    if (host === "genmobile.com" || host.endsWith(".genmobile.com")) {
        return true;
    }

    if (host === "emerios.com" || host.endsWith(".emerios.com")) {
        return true;
    }

    if (host === "localhost" || host === "127.0.0.1") {
        return true;
    }

    if (host.startsWith("fluxor-public.") || host.startsWith("fluxor-fe.")) {
        return true;
    }

    return false;
}

async function init(): Promise<void> {
    if (!shouldEnableForCurrentHost(window.location.hostname)) {
        return;
    }

    await initializeHostStorage();

    if (document.getElementById(BUTTON_ID)) {
        return;
    }

    const profile = getProfileForCurrentPage(window.location.hostname);
    attachZipCodeSuggestions(profile);

    const observer = new MutationObserver(() => {
        attachZipCodeSuggestions(profile);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    const button = createAutofillButton({ onAutofillClick: handleAutofillClick });
    document.body.appendChild(button);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        void init();
    });
} else {
    void init();
}
