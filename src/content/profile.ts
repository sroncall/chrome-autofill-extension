import type { PageProfile } from "./types";

export const MAILINATOR_DOMAIN = "mailinator.com";
export const BUTTON_ID = "smart-autofill-mailinator-btn";
export const ZIP_SUGGESTIONS_ID = "devbuddy-zip-suggestions";
export const AUTOFILL_BUTTON_DEFAULT_LABEL = "Auto + OTP";
export const INBOX_STORAGE_PREFIX = "devbuddy.mailinatorInbox";
export const INBOX_STORAGE_TTL_MS = 24 * 60 * 60 * 1000;
export const BUTTON_POSITION_STORAGE_PREFIX = "devbuddy.autofillButtonPosition";
export const ZIP_SUGGESTIONS_ENABLED_STORAGE_PREFIX = "devbuddy.zipSuggestionsEnabled";
export const LAST_NAME_OVERRIDE_STORAGE_PREFIX = "devbuddy.lastNameOverride";
export const AUTOFILL_PROFILE_STORAGE_PREFIX = "devbuddy.autofillProfile";
export const AUTOFILL_PROFILE_TTL_MS = 24 * 60 * 60 * 1000;

export const Patterns = {
    AddressLine1: /^([A-Za-z0-9\/,'-]{1,}) ([A-Za-z0-9\s\/,'-]{4,}|[A-Za-z0-9\S\/,'-]{3,})*$/,
    FirstName: /^$|^([a-zA-Z]+( [a-zA-Z\s]+)*){1,}$/,
    LastName: /^$|^([a-zA-Z]+( [a-zA-Z\s]+)*){2,}$/,
    Dob: /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(18|19|20)\d{2}$/,
    Phone: /^[2-9][0-9]{9}$/,
    Email: /^[a-zA-Z0-9\+_-]*(\.?[a-zA-Z0-9\+_-])+@[a-zA-Z0-9-]+(\.[0-9a-zA-Z]{2,3}){1,2}$/
} as const;

const defaultProfile: PageProfile = {
    firstName: [
        "#firstName",
        "#firstname",
        "input[name='firstName']",
        "input[name*='firstName']",
        "input[name='firstname']",
        "input[name='name']",
        "input[autocomplete='given-name']"
    ],
    lastName: [
        "#lastName",
        "#lastname",
        "input[name='lastName']",
        "input[name*='lastName']",
        "input[name='lastname']",
        "input[name='surname']",
        "input[autocomplete='family-name']"
    ],
    initials: [
        "#initials",
        "#userInitials",
        "input[name='initials']",
        "input[name='userInitials']",
        "input[name*='initial']",
        "input[name='globalConsent']",
        "input[name='agreementSigned']",
        "input[name='undestandementSigned']"
    ],
    email: [
        "#email",
        "input[type='email']",
        "input[name='email']",
        "input[name*='email'][aria-required='true']",
        "input[autocomplete='email']"
    ],
    streetAddress: [
        "#streetAddress",
        "#address",
        "#address1",
        "input[name='address']",
        "input[name='addressLine1']",
        "input[name*='addressLine1']",
        "input[name*='street']",
        "input[autocomplete='street-address']"
    ],
    apartment: [
        "#apartment",
        "#address2",
        "input[name='apartment']",
        "input[name='unit']",
        "input[name='address2']",
        "input[name*='apt']",
        "input[name*='unit']",
        "input[name*='addressLine2']",
        "input[autocomplete='address-line2']"
    ],
    zipCode: [
        "#zip",
        "#zipCode",
        "input[name='zip']",
        "input[name='zipcode']",
        "input[name='postalCode']",
        "input[name*='zip']",
        "input[name*='postal']",
        "input[autocomplete='postal-code']"
    ],
    ssn: [
        "#ssn",
        "input[name*='lastFourSsn']"
    ],
    dob: [
        "#dob",
        "input[name*='dateOfBirth']",
        "input[name*='dob']",
        "input[autocomplete='bday']"
    ],
    previousCarrier: [
        "select[name='hadPreviousLifelineCarrier']",
        "select[name*='lifeline']",
        "select[id*='lifeline']"
    ],
    phone: [
        "#phone",
        "input[type='tel']",
        "input[name='phone']",
        "input[name='phoneNumber']",
        "input[name*='phoneNumber']",
        "input[autocomplete='tel']"
    ],
    otp: [
        "#otp",
        "#code",
        "#verificationCode",
        "input[name='otp']",
        "input[name='code']",
        "input[name='verificationCode']",
        "input[autocomplete='one-time-code']"
    ],
    gender: [
        "#gender",
        "select[name='genderCode']",
    ],
    race: [
        "#raceCode",
        "select[name='raceCode']",
    ],
    caladRangeIncome: [
        "#caladRangeIncomeCode",
        "select[name='caladRangeIncomeCode']",
    ],
    signature: [
        "#signature",
        "input[name='signature']",
    ]
};

export function getProfileForCurrentPage(hostname: string): PageProfile {
    const host = hostname.toLowerCase();

    if (host.includes("checkout")) {
        return {
            ...defaultProfile,
            firstName: [...defaultProfile.firstName, "input[name='shipping-first-name']"],
            lastName: [...defaultProfile.lastName, "input[name='shipping-last-name']"]
        };
    }

    if (host.includes("auth") || host.includes("login") || host.includes("signin")) {
        return {
            ...defaultProfile,
            otp: [...defaultProfile.otp, "input[name='token']", "input[name='otpCode']"]
        };
    }

    return defaultProfile;
}