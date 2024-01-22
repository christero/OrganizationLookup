interface Organization {
    orgNumber: string;
    name: string
    brregName: string | null;
    numberOfEmployees: number | null;
    businessCategoryCode: string | null;
    legalStructureCode: string | null;
    isBankrupt: boolean | null;
    isDeleted: boolean | null;
}

export type { Organization};