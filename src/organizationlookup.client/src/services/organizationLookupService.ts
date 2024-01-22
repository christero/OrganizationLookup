import { OrgLookupRequest, OrgLookupResult } from '../interfaces/orgLookupInterfaces';

class OrganizationLookupService {
    static async performLookup(orgLookupRequest: OrgLookupRequest): Promise<OrgLookupResult> {
        try {
            const response = await fetch('https://localhost:7259/api/Organizations/lookup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orgLookupRequest),
            });

            if (response.ok) {
                const responseData: OrgLookupResult = await response.json();
                return responseData;
            } else {
                throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('An error occurred during the HTTP request:', error);
            throw error;
        }
    }
}

export default OrganizationLookupService;