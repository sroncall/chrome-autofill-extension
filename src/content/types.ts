export type SelectorList = string[];

export type PageProfile = {
    firstName: SelectorList;
    lastName: SelectorList;
    initials: SelectorList;
    email: SelectorList;
    phone: SelectorList;
    streetAddress: SelectorList;
    apartment: SelectorList;
    zipCode: SelectorList;
    ssn: SelectorList;
    dob: SelectorList;
    previousCarrier: SelectorList;
    otp: SelectorList;
    gender: SelectorList;
    race: SelectorList;
    caladRangeIncome: SelectorList;
    signature: SelectorList;
};

export type FillableElement = HTMLInputElement | HTMLTextAreaElement;

export type StoredInboxState = {
    inbox: string;
    email: string;
    updatedAt: number;
};

export type StoredAutofillProfile = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    zipCode: string;
    streetAddress: string;
    updatedAt: number;
};

export type OtpResponseMessage = {
    ok: boolean;
    otp?: string | null;
    error?: string;
};