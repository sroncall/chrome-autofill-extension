import { faker } from "@faker-js/faker";
import { fillStreetAddressFromZipCode } from "./address";
import {
    AUTOFILL_BUTTON_DEFAULT_LABEL,
    MAILINATOR_DOMAIN,
    Patterns,
    getProfileForCurrentPage
} from "./profile";
import {
    fetchLatestOtpFromMailinator,
    hasExtensionRuntimeMessaging,
    parseMailinatorInboxFromEmail,
    resolveMailinatorInbox,
    sanitizeInboxToken
} from "./mailinator";
import { getConfiguredLastName, loadStoredAutofillProfile, persistAutofillProfile } from "./storage";
import {
    buildInitials,
    delay,
    fillRequiredChoiceInputs,
    formatDobForInput,
    generatePatternSafeFirstName,
    generatePatternSafeLastName,
    generateUsPhoneNumber,
    queryAllInputs,
    queryFirstInput,
    queryFirstSelect,
    setInputValue,
    setSelectValueByTextOrValue
} from "./utils";

export async function handleAutofillClick(button: HTMLButtonElement): Promise<void> {
    const profile = getProfileForCurrentPage(window.location.hostname);
    const firstNameInput = queryFirstInput(profile.firstName);
    const lastNameInput = queryFirstInput(profile.lastName);
    const initialsInputs = queryAllInputs(profile.initials);
    const emailInput = queryFirstInput(profile.email);
    const storedProfile = loadStoredAutofillProfile();
    const shouldReuseStoredNames = Boolean(
        storedProfile && (!emailInput || (initialsInputs.length > 0 && !firstNameInput && !lastNameInput))
    );

    const firstName = shouldReuseStoredNames && storedProfile
        ? storedProfile.firstName
        : generatePatternSafeFirstName();
    const lastName = shouldReuseStoredNames && storedProfile
        ? storedProfile.lastName
        : (getConfiguredLastName() ?? generatePatternSafeLastName());

    const forceGenerateNewInbox = Boolean(emailInput);
    const inboxState = resolveMailinatorInbox(emailInput, firstName, lastName, forceGenerateNewInbox);
    const inbox = inboxState.inbox;
    const email = Patterns.Email.test(inboxState.email)
        ? inboxState.email
        : `${sanitizeInboxToken(firstName)}.${sanitizeInboxToken(lastName)}@${MAILINATOR_DOMAIN}`;
    const phone = generateUsPhoneNumber();
    const ssn = faker.string.numeric(4);
    const birthDate = faker.date.birthdate({ min: 18, max: 65, mode: "age" });
    const dobInput = queryFirstInput(profile.dob);
    let dob = formatDobForInput(dobInput, birthDate);
    if (!(dobInput instanceof HTMLInputElement && dobInput.type === "date") && !Patterns.Dob.test(dob)) {
        dob = "01/15/1995";
    }

    const otpInput = queryFirstInput(profile.otp);
    const initials = buildInitials(firstName, lastName);

    setInputValue(firstNameInput, firstName);
    setInputValue(lastNameInput, lastName);
    if (initials) {
        for (const initialsInput of initialsInputs) {
            setInputValue(initialsInput, initials);
        }
    }

    if (forceGenerateNewInbox || !emailInput?.value?.trim() || parseMailinatorInboxFromEmail(emailInput.value.trim())) {
        setInputValue(emailInput, email);
    }

    setInputValue(queryFirstInput(profile.phone), phone);
    fillStreetAddressFromZipCode(profile);
    setInputValue(queryFirstInput(profile.ssn), ssn);
    setInputValue(dobInput, dob);
    setSelectValueByTextOrValue(queryFirstSelect(profile.previousCarrier), "no");
    setSelectValueByTextOrValue(queryFirstSelect(profile.gender), "Male");
    setSelectValueByTextOrValue(queryFirstSelect(profile.race), "Hispanic");
    setSelectValueByTextOrValue(queryFirstSelect(profile.caladRangeIncome), "10,000-19,999");
    fillRequiredChoiceInputs();
    setInputValue(queryFirstInput(profile.signature), `${firstName} ${lastName}`);

    persistAutofillProfile({
        firstName,
        lastName,
        email,
        phone,
        zipCode: queryFirstInput(profile.zipCode)?.value?.trim() ?? "",
        streetAddress: queryFirstInput(profile.streetAddress)?.value?.trim() ?? ""
    });

    if (!otpInput) {
        button.textContent = "Datos completados";
        await delay(1500);
        button.textContent = AUTOFILL_BUTTON_DEFAULT_LABEL;
        return;
    }

    if (!hasExtensionRuntimeMessaging()) {
        button.textContent = "OTP no disponible en este contexto";
        await delay(1800);
        button.textContent = AUTOFILL_BUTTON_DEFAULT_LABEL;
        return;
    }

    button.textContent = "Leyendo OTP...";

    try {
        const otp = await fetchLatestOtpFromMailinator(inbox);
        button.textContent = otp ? `OTP aplicado: ${otp}` : "OTP aun no llega (espera 20s)";
        if (otp) {
            setInputValue(otpInput, otp);
        }
    } catch (error) {
        console.error("Error al buscar OTP en Mailinator", error);
        button.textContent = "Error consultando Mailinator";
    } finally {
        await delay(2500);
        button.textContent = AUTOFILL_BUTTON_DEFAULT_LABEL;
    }
}