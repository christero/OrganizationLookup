using Moq;
using OrganizationLookup.Server.ApiClients;
using OrganizationLookup.Server.DTOs.Response;
using OrganizationLookup.Server.Services;
using System.Net;

namespace OrganizationLookup.Server.UnitTests.Services
{
    public class OrganizationLookupServiceTests
    {
        private readonly OrganizationLookupService _service;
        private readonly Mock<IBrregApiClient> _brregApiClientMock;

        public OrganizationLookupServiceTests()
        {
            _brregApiClientMock = new Mock<IBrregApiClient>();
            _service = new OrganizationLookupService(_brregApiClientMock.Object);
        }

        [Fact]
        public async Task GetOrganizationsDetails_NotFound_ReturnsErrors()
        {
            var organizationNumbers = new List<string> { "789" };
            var errorStatusCode = HttpStatusCode.NotFound;

            _brregApiClientMock.Setup(x => x.FetchOrganizationDetails("789"))
                .ReturnsAsync(ApiResult<BrregOrganizationDetailsDTO>.Failure(errorStatusCode));

            var service = new OrganizationLookupService(_brregApiClientMock.Object);

            var (organizations, errors) = await _service.GetOrganizationsDetails(organizationNumbers);

            Assert.Empty(organizations);
            Assert.NotNull(errors);
            Assert.Single(errors);
            Assert.Contains($"OrganizationNumber: {organizationNumbers.First()} - Status code: {(int)errorStatusCode} {errorStatusCode}", errors);
        }

        [Fact]
        public async Task GetOrganizationsDetails_WithSuccess_ReturnsOrga()
        {
            var organizationNumbers = new List<string> { "123", "456" };

            var mockApiClient = new Mock<IBrregApiClient>();
            var successStatusCode = HttpStatusCode.OK;

            mockApiClient.Setup(x => x.FetchOrganizationDetails("123"))
                .ReturnsAsync(ApiResult<BrregOrganizationDetailsDTO>.Success(new BrregOrganizationDetailsDTO()));
            mockApiClient.Setup(x => x.FetchOrganizationDetails("456"))
                .ReturnsAsync(ApiResult<BrregOrganizationDetailsDTO>.Success(new BrregOrganizationDetailsDTO()));

            var service = new OrganizationLookupService(mockApiClient.Object);

            var (organizations, errors) = await service.GetOrganizationsDetails(organizationNumbers);

            Assert.NotNull(organizations);
            Assert.Empty(errors);
            Assert.Equal(organizationNumbers.Count, organizations.Count);
        }
    }
}
