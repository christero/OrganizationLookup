using System.ComponentModel.DataAnnotations;

namespace OrganizationLookup.Server.DTOs.Request
{
    public class OrgLookupRequestDTO
    {
        public List<OrganizationRequest> Organizations { get; set; } = [];
    }

    public class OrganizationRequest
    {
        [Required(ErrorMessage = "Organizationsnumber is required")]
        public string OrgNumber { get; set; }
    }
}
