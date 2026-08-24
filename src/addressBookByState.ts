export type AddressEntry = {
    zipCode: string;
    streetAddress: string;
};

export type ZipCodeSuggestion = {
    zipCode: string;
    stateCodes: string[];
};

export type AddressBookByState = Record<string, AddressEntry[]>;

// Direcciones conocidas por estado; sin limite fijo por estado.
export const ADDRESS_BOOK_BY_STATE: AddressBookByState = {
    AL: [
        { zipCode: "35203", streetAddress: "201 20th St N" },
        { zipCode: "36104", streetAddress: "445 Dexter Ave" },
        { zipCode: "36602", streetAddress: "1 Water St" }
    ],
    AK: [
        { zipCode: "99501", streetAddress: "500 W 7th Ave" },
        { zipCode: "99801", streetAddress: "155 S Seward St" },
        { zipCode: "99701", streetAddress: "100 Cushman St" }
    ],
    AZ: [
        { zipCode: "85004", streetAddress: "200 W Washington St" },
        { zipCode: "85701", streetAddress: "115 N Church Ave" },
        { zipCode: "86001", streetAddress: "211 W Aspen Ave" }
    ],
    AR: [
        { zipCode: "72201", streetAddress: "500 President Clinton Ave" },
        { zipCode: "72209", streetAddress: "8300 GEYER SPRINGS RD" },
        { zipCode: "72701", streetAddress: "21 S Block Ave" },
        { zipCode: "71601", streetAddress: "200 E 8th Ave" }
    ],
    CA: [
        { zipCode: "90010", streetAddress: "3020 Wilshire Blvd Ste 250" },
        { zipCode: "90012", streetAddress: "200 N Spring St" },
        { zipCode: "90210", streetAddress: "605 N Whittier Dr" },
        { zipCode: "90001", streetAddress: "8511 Compton Ave" },
        { zipCode: "90017", streetAddress: "555 W 5th St" },
        { zipCode: "90024", streetAddress: "10889 Wilshire Blvd" },
        { zipCode: "90028", streetAddress: "6801 Hollywood Blvd" },
        { zipCode: "90045", streetAddress: "1 World Way" },
        { zipCode: "90211", streetAddress: "8500 Wilshire Blvd" },
        { zipCode: "90212", streetAddress: "9350 Wilshire Blvd" },
        { zipCode: "90230", streetAddress: "6000 Sepulveda Blvd" },
        { zipCode: "90232", streetAddress: "9770 Culver Blvd" },
        { zipCode: "90245", streetAddress: "350 Main St" },
        { zipCode: "90401", streetAddress: "1685 Main St" },
        { zipCode: "90405", streetAddress: "2427 Main St" },
        { zipCode: "90650", streetAddress: "12700 Norwalk Blvd" },
        { zipCode: "90802", streetAddress: "333 W Ocean Blvd" },
        { zipCode: "91007", streetAddress: "300 W Huntington Dr" },
        { zipCode: "91101", streetAddress: "100 Garfield Ave" },
        { zipCode: "91311", streetAddress: "21010 Vanowen St" },
        { zipCode: "91608", streetAddress: "100 Universal City Plz" },
        { zipCode: "92101", streetAddress: "202 C St" },
        { zipCode: "92108", streetAddress: "7510 Hazard Center Dr" },
        { zipCode: "92614", streetAddress: "200 Spectrum Center Dr" },
        { zipCode: "92618", streetAddress: "800 Spectrum Center Dr" },
        { zipCode: "92701", streetAddress: "20 Civic Center Plz" },
        { zipCode: "92805", streetAddress: "200 S Anaheim Blvd" },
        { zipCode: "93101", streetAddress: "735 Anacapa St" },
        { zipCode: "94102", streetAddress: "1 Dr Carlton B Goodlett Pl" },
        { zipCode: "94103", streetAddress: "1 Market St" },
        { zipCode: "94105", streetAddress: "425 Market St" },
        { zipCode: "94107", streetAddress: "1800 Owens St" },
        { zipCode: "94301", streetAddress: "300 Hamilton Ave" },
        { zipCode: "94401", streetAddress: "330 W 20th Ave" },
        { zipCode: "94501", streetAddress: "1416 Oak St" },
        { zipCode: "94612", streetAddress: "1 Frank H Ogawa Plz" },
        { zipCode: "94704", streetAddress: "2120 Berkeley Way" },
        { zipCode: "95113", streetAddress: "200 E Santa Clara St" },
        { zipCode: "95814", streetAddress: "915 I St" },
        { zipCode: "96130", streetAddress: "100 N Lassen St" }
    ],
    CO: [
        { zipCode: "80202", streetAddress: "1701 Wynkoop St" },
        { zipCode: "80903", streetAddress: "107 N Nevada Ave" },
        { zipCode: "80302", streetAddress: "1300 Canyon Blvd" }
    ],
    CT: [
        { zipCode: "06103", streetAddress: "250 Constitution Plz" },
        { zipCode: "06510", streetAddress: "195 Church St" },
        { zipCode: "06810", streetAddress: "155 Deer Hill Ave" }
    ],
    DE: [
        { zipCode: "19801", streetAddress: "800 N French St" },
        { zipCode: "19901", streetAddress: "15 Loockerman Plz" },
        { zipCode: "19947", streetAddress: "2 N Main St" }
    ],
    FL: [
        { zipCode: "33132", streetAddress: "401 Biscayne Blvd" },
        { zipCode: "32801", streetAddress: "400 S Orange Ave" },
        { zipCode: "33602", streetAddress: "777 N Ashley Dr" }
    ],
    GA: [
        { zipCode: "30303", streetAddress: "55 Trinity Ave SW" },
        { zipCode: "31401", streetAddress: "2 E Bay St" },
        { zipCode: "30601", streetAddress: "301 College Ave" }
    ],
    HI: [
        { zipCode: "96813", streetAddress: "530 S King St" },
        { zipCode: "96720", streetAddress: "100 Pauahi St" },
        { zipCode: "96732", streetAddress: "200 S High St" }
    ],
    ID: [
        { zipCode: "83702", streetAddress: "150 N Capitol Blvd" },
        { zipCode: "83402", streetAddress: "610 Memorial Dr" },
        { zipCode: "83814", streetAddress: "710 E Mullan Ave" }
    ],
    IL: [
        { zipCode: "60601", streetAddress: "201 E Randolph St" },
        { zipCode: "62701", streetAddress: "300 S 9th St" },
        { zipCode: "61602", streetAddress: "419 Fulton St" }
    ],
    IN: [
        { zipCode: "46204", streetAddress: "200 E Washington St" },
        { zipCode: "46802", streetAddress: "1 E Main St" },
        { zipCode: "47708", streetAddress: "1 NW Martin Luther King Jr Blvd" }
    ],
    IA: [
        { zipCode: "50309", streetAddress: "700 Locust St" },
        { zipCode: "52401", streetAddress: "101 First St SE" },
        { zipCode: "51101", streetAddress: "626 Douglas St" }
    ],
    KS: [
        { zipCode: "66603", streetAddress: "214 SE 8th Ave" },
        { zipCode: "67202", streetAddress: "455 N Main St" },
        { zipCode: "66044", streetAddress: "2 E 7th St" },
        { zipCode: "67621", streetAddress: "941 KANSAS AVENUE" }
    ],
    KY: [
        { zipCode: "40202", streetAddress: "400 S 2nd St" },
        { zipCode: "40507", streetAddress: "200 E Main St" },
        { zipCode: "42101", streetAddress: "1001 College St" }
    ],
    LA: [
        { zipCode: "70112", streetAddress: "1300 Perdido St" },
        { zipCode: "70801", streetAddress: "222 St Louis St" },
        { zipCode: "71101", streetAddress: "500 Travis St" }
    ],
    ME: [
        { zipCode: "04101", streetAddress: "389 Congress St" },
        { zipCode: "04401", streetAddress: "73 Harlow St" },
        { zipCode: "04330", streetAddress: "16 Cony St" }
    ],
    MD: [
        { zipCode: "21202", streetAddress: "100 N Holliday St" },
        { zipCode: "21401", streetAddress: "160 Duke of Gloucester St" },
        { zipCode: "20910", streetAddress: "1 Veterans Pl" }
    ],
    MA: [
        { zipCode: "02108", streetAddress: "1 City Hall Sq" },
        { zipCode: "01103", streetAddress: "36 Court St" },
        { zipCode: "01608", streetAddress: "455 Main St" }
    ],
    MI: [
        { zipCode: "48226", streetAddress: "2 Woodward Ave" },
        { zipCode: "48933", streetAddress: "124 W Michigan Ave" },
        { zipCode: "49503", streetAddress: "300 Monroe Ave NW" }
    ],
    MN: [
        { zipCode: "55102", streetAddress: "15 W Kellogg Blvd" },
        { zipCode: "55415", streetAddress: "350 S 5th St" },
        { zipCode: "55802", streetAddress: "411 W 1st St" }
    ],
    MS: [
        { zipCode: "39201", streetAddress: "219 S President St" },
        { zipCode: "39530", streetAddress: "140 Lameuse St" },
        { zipCode: "38655", streetAddress: "107 Courthouse Sq" }
    ],
    MO: [
        { zipCode: "63103", streetAddress: "1200 Market St" },
        { zipCode: "65101", streetAddress: "320 E McCarty St" },
        { zipCode: "65806", streetAddress: "840 Boonville Ave" }
    ],
    MT: [
        { zipCode: "59601", streetAddress: "316 N Park Ave" },
        { zipCode: "59101", streetAddress: "210 N 27th St" },
        { zipCode: "59802", streetAddress: "435 Ryman St" }
    ],
    NE: [
        { zipCode: "68508", streetAddress: "555 S 10th St" },
        { zipCode: "68102", streetAddress: "1819 Farnam St" },
        { zipCode: "68801", streetAddress: "100 E 1st St" }
    ],
    NV: [
        { zipCode: "89501", streetAddress: "1 E 1st St" },
        { zipCode: "89701", streetAddress: "201 N Carson St" },
        { zipCode: "89101", streetAddress: "495 S Main St" }
    ],
    NH: [
        { zipCode: "03301", streetAddress: "41 Green St" },
        { zipCode: "03101", streetAddress: "1 City Hall Plz" },
        { zipCode: "03801", streetAddress: "1 Junkins Ave" }
    ],
    NJ: [
        { zipCode: "08608", streetAddress: "319 E State St" },
        { zipCode: "07102", streetAddress: "920 Broad St" },
        { zipCode: "07302", streetAddress: "280 Grove St" }
    ],
    NM: [
        { zipCode: "87501", streetAddress: "200 Lincoln Ave" },
        { zipCode: "87102", streetAddress: "1 Civic Plz NW" },
        { zipCode: "88001", streetAddress: "700 N Main St" }
    ],
    NY: [
        { zipCode: "10001", streetAddress: "281 9TH AVE" },
        { zipCode: "10002", streetAddress: "1 Police Plz" },
        { zipCode: "10003", streetAddress: "33 Irving Pl" },
        { zipCode: "10004", streetAddress: "1 Battery Pl" },
        { zipCode: "10005", streetAddress: "48 Wall St" },
        { zipCode: "10006", streetAddress: "100 Trinity Pl" },
        { zipCode: "10007", streetAddress: "1 Centre St" },
        { zipCode: "10010", streetAddress: "230 Park Ave" },
        { zipCode: "10011", streetAddress: "111 8th Ave" },
        { zipCode: "10012", streetAddress: "550 Broadway" },
        { zipCode: "10013", streetAddress: "375 Hudson St" },
        { zipCode: "10014", streetAddress: "401 W 14th St" },
        { zipCode: "10016", streetAddress: "450 Lexington Ave" },
        { zipCode: "10017", streetAddress: "200 Park Ave" },
        { zipCode: "10018", streetAddress: "11 Times Sq" },
        { zipCode: "10019", streetAddress: "10 Columbus Cir" },
        { zipCode: "10022", streetAddress: "399 Park Ave" },
        { zipCode: "10036", streetAddress: "1515 Broadway" },
        { zipCode: "10118", streetAddress: "20 W 34th St" },
        { zipCode: "11101", streetAddress: "27-01 Queens Plz N" },
        { zipCode: "11201", streetAddress: "209 Joralemon St" },
        { zipCode: "11204", streetAddress: "5601 16TH AVE" },
        { zipCode: "11211", streetAddress: "25 Kent Ave" },
        { zipCode: "11215", streetAddress: "475 4th Ave" },
        { zipCode: "11701", streetAddress: "100 Broadway" },
        { zipCode: "11354", streetAddress: "135-20 39th Ave" },
        { zipCode: "11430", streetAddress: "JFK Access Rd" },
        { zipCode: "12203", streetAddress: "1 Crossgates Mall Rd" },
        { zipCode: "12207", streetAddress: "24 Eagle St" },
        { zipCode: "13202", streetAddress: "233 E Washington St" },
        { zipCode: "14604", streetAddress: "100 S Clinton Ave" },
        { zipCode: "14202", streetAddress: "65 Niagara Sq" }
    ],
    NC: [
        { zipCode: "27601", streetAddress: "222 W Hargett St" },
        { zipCode: "28202", streetAddress: "600 E 4th St" },
        { zipCode: "28801", streetAddress: "70 Court Plz" }
    ],
    ND: [
        { zipCode: "58501", streetAddress: "221 N 5th St" },
        { zipCode: "58102", streetAddress: "200 3rd St N" },
        { zipCode: "58201", streetAddress: "255 N 4th St" }
    ],
    OH: [
        { zipCode: "43215", streetAddress: "90 W Broad St" },
        { zipCode: "44114", streetAddress: "601 Lakeside Ave" },
        { zipCode: "45202", streetAddress: "801 Plum St" }
    ],
    OK: [
        { zipCode: "73102", streetAddress: "200 N Walker Ave" },
        { zipCode: "74103", streetAddress: "175 E 2nd St" },
        { zipCode: "73401", streetAddress: "10 W Main St" }
    ],
    OR: [
        { zipCode: "97204", streetAddress: "1221 SW 4th Ave" },
        { zipCode: "97401", streetAddress: "777 Pearl St" },
        { zipCode: "97701", streetAddress: "710 NW Wall St" }
    ],
    PA: [
        { zipCode: "19107", streetAddress: "1400 John F Kennedy Blvd" },
        { zipCode: "17101", streetAddress: "10 N 2nd St" },
        { zipCode: "15222", streetAddress: "414 Grant St" }
    ],
    RI: [
        { zipCode: "02903", streetAddress: "25 Dorrance St" },
        { zipCode: "02840", streetAddress: "43 Broadway" },
        { zipCode: "02860", streetAddress: "137 Roosevelt Ave" }
    ],
    SC: [
        { zipCode: "29201", streetAddress: "1737 Main St" },
        { zipCode: "29401", streetAddress: "80 Broad St" },
        { zipCode: "29601", streetAddress: "206 S Main St" }
    ],
    SD: [
        { zipCode: "57501", streetAddress: "230 N Dakota Ave" },
        { zipCode: "57104", streetAddress: "224 W 9th St" },
        { zipCode: "57701", streetAddress: "300 6th St" }
    ],
    TN: [
        { zipCode: "37219", streetAddress: "1 Public Sq" },
        { zipCode: "38103", streetAddress: "125 N Main St" },
        { zipCode: "37402", streetAddress: "101 E 11th St" }
    ],
    TX: [
        { zipCode: "78701", streetAddress: "301 W 2nd St" },
        { zipCode: "77002", streetAddress: "901 Bagby St" },
        { zipCode: "75201", streetAddress: "1500 Marilla St" },
        { zipCode: "75001", streetAddress: "15201 Dallas Pkwy" },
        { zipCode: "75006", streetAddress: "2345 Valwood Pkwy" },
        { zipCode: "75024", streetAddress: "6121 W Park Blvd" },
        { zipCode: "75034", streetAddress: "6101 Frisco Square Blvd" },
        { zipCode: "75039", streetAddress: "300 Las Colinas Blvd E" },
        { zipCode: "75202", streetAddress: "300 Reunion Blvd" },
        { zipCode: "75204", streetAddress: "3030 Olive St" },
        { zipCode: "75211", streetAddress: "5525 W ILLINOIS AVE" },
        { zipCode: "75219", streetAddress: "2500 Cedar Springs Rd" },
        { zipCode: "75225", streetAddress: "8687 N Central Expy" },
        { zipCode: "76102", streetAddress: "1000 Throckmorton St" },
        { zipCode: "76107", streetAddress: "2750 W 7th St" },
        { zipCode: "77005", streetAddress: "5607 Morningside Dr" },
        { zipCode: "77007", streetAddress: "3015 Washington Ave" },
        { zipCode: "77024", streetAddress: "1000 Memorial City Way" },
        { zipCode: "77056", streetAddress: "5085 Westheimer Rd" },
        { zipCode: "77057", streetAddress: "2100 West Loop S" },
        { zipCode: "77058", streetAddress: "1601 E NASA Pkwy" },
        { zipCode: "77084", streetAddress: "17400 Northwest Fwy" },
        { zipCode: "78205", streetAddress: "100 W Houston St" },
        { zipCode: "78215", streetAddress: "303 Pearl Pkwy" },
        { zipCode: "78501", streetAddress: "700 N Main St" },
        { zipCode: "78613", streetAddress: "1435 Main St" },
        { zipCode: "78704", streetAddress: "1901 S Congress Ave" },
        { zipCode: "78745", streetAddress: "6001 W William Cannon Dr" },
        { zipCode: "79901", streetAddress: "300 N Campbell St" }
    ],
    UT: [
        { zipCode: "84074", streetAddress: "245 N Main St" },
        { zipCode: "84111", streetAddress: "451 S State St" },
        { zipCode: "84601", streetAddress: "445 W Center St" }
    ],
    VT: [
        { zipCode: "05602", streetAddress: "39 Main St" },
        { zipCode: "05401", streetAddress: "149 Church St" },
        { zipCode: "05701", streetAddress: "1 Strongs Ave" }
    ],
    VA: [
        { zipCode: "23219", streetAddress: "900 E Broad St" },
        { zipCode: "23510", streetAddress: "810 Union St" },
        { zipCode: "22314", streetAddress: "301 King St" }
    ],
    WA: [
        { zipCode: "98104", streetAddress: "600 4th Ave" },
        { zipCode: "98501", streetAddress: "601 4th Ave E" },
        { zipCode: "99201", streetAddress: "808 W Spokane Falls Blvd" }
    ],
    WV: [
        { zipCode: "25301", streetAddress: "501 Virginia St E" },
        { zipCode: "26505", streetAddress: "389 Spruce St" },
        { zipCode: "26003", streetAddress: "1500 Chapline St" }
    ],
    WI: [
        { zipCode: "53703", streetAddress: "210 Martin Luther King Jr Blvd" },
        { zipCode: "53202", streetAddress: "200 E Wells St" },
        { zipCode: "54301", streetAddress: "100 N Jefferson St" }
    ],
    WY: [
        { zipCode: "82001", streetAddress: "2101 O Neil Ave" },
        { zipCode: "82801", streetAddress: "55 Grinnell Plz" },
        { zipCode: "82601", streetAddress: "200 N David St" }
    ]
};

const ZIP_CODE_REGEX = /^\d{5}$/;
// Mirrors provided AddressLine1 frontend validation pattern.
const STREET_ADDRESS_REGEX = /^([A-Za-z0-9\/,'-]{1,}) ([A-Za-z0-9\s\/,'-]{4,}|[A-Za-z0-9\S\/,'-]{3,})*$/;

function normalizeStreetAddress(streetAddress: string): string {
    return streetAddress
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeAddressEntry(entry: AddressEntry): AddressEntry {
    return {
        zipCode: entry.zipCode.replace(/\D/g, "").slice(0, 5),
        streetAddress: normalizeStreetAddress(entry.streetAddress)
    };
}

function isValidAddressEntry(entry: AddressEntry): boolean {
    if (!ZIP_CODE_REGEX.test(entry.zipCode)) {
        return false;
    }

    if (!STREET_ADDRESS_REGEX.test(entry.streetAddress)) {
        return false;
    }

    return true;
}

const VALIDATED_ADDRESS_BOOK_BY_STATE: AddressBookByState = Object.fromEntries(
    Object.entries(ADDRESS_BOOK_BY_STATE).map(([state, entries]) => {
        const validEntries = entries
            .map(normalizeAddressEntry)
            .filter(isValidAddressEntry);

        return [state, validEntries];
    })
) as AddressBookByState;

export function findAddressByZipCode(zipCode: string): AddressEntry | null {
    const normalizedZip = zipCode.replace(/\D/g, "").slice(0, 5);
    if (!normalizedZip) {
        return null;
    }

    const matches: AddressEntry[] = [];

    for (const stateEntries of Object.values(VALIDATED_ADDRESS_BOOK_BY_STATE)) {
        for (const entry of stateEntries) {
            if (entry.zipCode === normalizedZip) {
                matches.push(entry);
            }
        }
    }

    if (matches.length > 0) {
        return matches[Math.floor(Math.random() * matches.length)];
    }

    return null;
}

export function getRandomKnownAddress(): AddressEntry {
    const allEntries = Object.values(VALIDATED_ADDRESS_BOOK_BY_STATE).flat();
    return allEntries[Math.floor(Math.random() * allEntries.length)];
}

export function getKnownZipCodes(): string[] {
    const uniqueZipCodes = new Set<string>();

    for (const stateEntries of Object.values(VALIDATED_ADDRESS_BOOK_BY_STATE)) {
        for (const entry of stateEntries) {
            uniqueZipCodes.add(entry.zipCode);
        }
    }

    return [...uniqueZipCodes].sort((a, b) => a.localeCompare(b));
}

export function getKnownZipCodeSuggestions(): ZipCodeSuggestion[] {
    const zipToStates = new Map<string, Set<string>>();

    for (const [stateCode, stateEntries] of Object.entries(VALIDATED_ADDRESS_BOOK_BY_STATE)) {
        for (const entry of stateEntries) {
            let states = zipToStates.get(entry.zipCode);
            if (!states) {
                states = new Set<string>();
                zipToStates.set(entry.zipCode, states);
            }
            states.add(stateCode);
        }
    }

    return [...zipToStates.entries()]
        .map(([zipCode, stateCodes]) => ({
            zipCode,
            stateCodes: [...stateCodes].sort((a, b) => a.localeCompare(b))
        }))
        .sort((a, b) => a.zipCode.localeCompare(b.zipCode));
}