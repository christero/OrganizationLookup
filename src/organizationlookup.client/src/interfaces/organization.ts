interface Organization {
    orgNumber: string;
    name: string
    brregName: string;
    numberOfEmployees: number
    businessCategoryCode: string;
    legalStructureCode: string;
    isBankrupt: boolean;
    isDeleted: boolean;
}

export type { Organization};