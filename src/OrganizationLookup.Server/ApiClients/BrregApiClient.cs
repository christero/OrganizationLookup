using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using OrganizationLookup.Server.DTOs.Response;
using OrganizationLookup.Server.Models;

namespace OrganizationLookup.Server.ApiClients
{
    public class BrregApiClient : IBrregApiClient
    {
        private readonly HttpClient _httpClient;
        private const string BaseUrl = "https://data.brreg.no/enhetsregisteret/api/";

        public BrregApiClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<ApiResult<BrregOrganizationDetailsDTO>> FetchOrganizationDetails(string orgNumber)
        {
            var response = await _httpClient.GetAsync($"{BaseUrl}enheter/{orgNumber}");

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();

                var organizationDetails = JsonConvert.DeserializeObject<BrregOrganizationDetailsDTO>(content);
                return ApiResult<BrregOrganizationDetailsDTO>.Success(organizationDetails!);
            }

            return ApiResult<BrregOrganizationDetailsDTO>.Failure(response.StatusCode);
        }
    }
}
