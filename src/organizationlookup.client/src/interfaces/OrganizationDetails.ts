interface IOrganization {
    orgNumber: string;
    name: string
    brregName: string | null;
    numberOfEmployees: number | null;
    businessCategoryCode: string | null;
    legalStructureCode: string | null;
    isBankrupt: boolean | null;
    isDeleted: boolean | null;
}

export type { IOrganization};