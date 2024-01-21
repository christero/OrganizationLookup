interface IOrgLookupRequest {
    organizations: IOrgLookup[];
}

interface IOrgLookup {
    orgNumber: string;
}

export type { IOrgLookupRequest, IOrgLookup };