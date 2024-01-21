using OrganizationLookup.Server.ApiClients;
using OrganizationLookup.Server.DTOs.Response;
using OrganizationLookup.Server.Models;

namespace OrganizationLookup.Server.Services
{
    public class OrganizationLookupService : IOrganizationLookupService
    {
        private readonly IBrregApiClient _brregApiClient;
        private readonly SemaphoreSlim _semaphore;

        private const int MaxConcurrentConnections = 2;

        public OrganizationLookupService(IBrregApiClient brregApiClient)
        {
            _brregApiClient = brregApiClient;
            _semaphore = new SemaphoreSlim(MaxConcurrentConnections);
        }

        public async Task<(List<Organization> Organizations, List<string> Errors)> GetOrganizationsDetails(IEnumerable<string> organizationNumbers)
        {
            var results = await Task.WhenAll(organizationNumbers.Select(GetOrganizationDetailsAsync));

            var organizations = new List<Organization>();
            var errors = new List<string>();

            foreach (var (organization, error) in results)
            {
                if (error == null)
                {
                    organizations.Add(organization!);
                }
                else
                {
                    errors.Add(error);
                }
            }

            return (organizations, errors);
        }

        private async Task<(Organization? Organization, string? Error)> GetOrganizationDetailsAsync(string organizationNumber)
        {
            await _semaphore.WaitAsync();

            try
            {
                var result = await _brregApiClient.FetchOrganizationDetails(organizationNumber);

                if (result.IsSuccess)
                {
                    return (MapToOrganization(result.Value!), null);
                }
                else
                {
                    return (null, $"OrganizationNumber: {organizationNumber} - Status code: {(int)result.StatusCode} {result.StatusCode}");
                }
            }
            finally
            {
                _semaphore.Release();
            }
        }
        // TODO GÅ over nullable og default verdier. brreg sier "Obligatorisk, feltet vil alltid være med i responsen", men man vet aldri.
        private Organization MapToOrganization(BrregOrganizationDetailsDTO organizationDetails)
        {
            return new Organization
            {
                OrgNumber = organizationDetails.OrganizationNumber,
                BrregName = organizationDetails.BrregName,
                NumberOfEmployees = organizationDetails.NumberOfEmployees.GetValueOrDefault(),
                BusinessCategoryCode = organizationDetails.BusinessCategory?.Code,
                LegalStructureCode = organizationDetails.LegalStructure?.Code,
                IsBankrupt = organizationDetails.IsBankrupt,
                IsDeleted = organizationDetails.IsDeleted
            };
        }
    }
}
