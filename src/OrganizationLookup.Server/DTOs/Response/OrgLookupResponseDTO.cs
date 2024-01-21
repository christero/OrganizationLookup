using OrganizationLookup.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace OrganizationLookup.Server.DTOs.Response
{
    public class OrgLookupResponseDTO
    {
        public List<Organization> Organizations { get; set; }
        public string? Errors { get; set; }
    }

}
