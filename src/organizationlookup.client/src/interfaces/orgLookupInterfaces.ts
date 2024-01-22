import { Organization } from './organization';

interface OrgLookupRequest {
    organizations: OrgLookup[];
}

interface OrgLookup {
    orgNumber: string;
}

interface OrgLookupResult {
    organizations: Organization[];
    errors: string;
}

export type { OrgLookupRequest, OrgLookup, OrgLookupResult };