using Newtonsoft.Json;

namespace OrganizationLookup.Server.DTOs.Response
{
    public class BrregOrganizationDetailsDTO
    {
        [JsonProperty("organisasjonsnummer")]
        public string? OrganizationNumber { get; set; }

        [JsonProperty("navn")]
        public string? BrregName { get; set; }

        [JsonProperty("antallAnsatte")]
        public int? NumberOfEmployees { get; set; }


        [JsonProperty("naeringskode1")]
        public BusinessCategory? BusinessCategory { get; set; }

        [JsonProperty("organisasjonsform")]
        public LegalStructure? LegalStructure { get; set; }

        [JsonProperty("konkurs")]
        public bool IsBankrupt { get; set; }

        [JsonProperty("slettedato")]
        public DateTime? DeletedDate { get; set; }

        public bool IsDeleted => DeletedDate.HasValue;
    }

    public class BusinessCategory
    {
        [JsonProperty("kode")]
        public string? Code { get; set; }
    }

    public class LegalStructure
    {
        [JsonProperty("kode")]
        public string? Code { get; set; }
    }
}
