using OrganizationLookup.Server.DTOs.Response;
using OrganizationLookup.Server.Models;

namespace OrganizationLookup.Server.ApiClients
{
    public interface IBrregApiClient
    {
        Task<ApiResult<BrregOrganizationDetailsDTO>> FetchOrganizationDetails(string orgNumber);
    }
}
