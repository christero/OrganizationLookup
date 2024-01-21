using Newtonsoft.Json;

namespace OrganizationLookup.Server.Models
{
    public class Organization
    {
        public string OrgNumber { get; set; }
        public string BrregName { get; set; }
        public int NumberOfEmployees { get; set; }
        public string BusinessCategoryCode { get; set; }
        public string LegalStructureCode { get; set; }
        public bool IsBankrupt { get; set; }
        public bool IsDeleted { get; set; }
    }
}
