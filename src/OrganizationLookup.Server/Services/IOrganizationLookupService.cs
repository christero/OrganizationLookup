using OrganizationLookup.Server.Models;

namespace OrganizationLookup.Server.Services
{
    public interface IOrganizationLookupService
    {
        Task<(List<Organization> Organizations, List<string> Errors)> GetOrganizationsDetails(IEnumerable<string> organizationNumbers);
    }
}
