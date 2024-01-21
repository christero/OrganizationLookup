using Microsoft.AspNetCore.Http;
using Moq;
using Moq.Protected;
using Newtonsoft.Json;
using OrganizationLookup.Server.ApiClients;
using OrganizationLookup.Server.DTOs.Response;
using System.Net;

namespace OrganizationLookup.Server.UnitTests.ApiClients
{
    public class BrregApiClientTests
    {
        private readonly Mock<HttpMessageHandler> _handlerMock;
        public BrregApiClientTests()
        {
            _handlerMock = new Mock<HttpMessageHandler>(MockBehavior.Strict);
        }

        [Fact]
        public async Task GetOrganizationDetails_Success()
        {
            var orgNumber = "123456789";

            var organizationResult = new BrregOrganizationDetailsDTO
            {
                OrganizationNumber = orgNumber,
                BrregName = "Sample Organization",
                NumberOfEmployees = 100,
                BusinessCategory = new BusinessCategory { Code = "ABC" },
                LegalStructure = new LegalStructure { Code = "XYZ" },
                IsBankrupt = false,
                DeletedDate = null
            };

            var apiClient = CreateApiClientWithMockResponse(HttpStatusCode.OK, organizationResult);

            var result = await apiClient.FetchOrganizationDetails(orgNumber);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Value);
            Assert.Equal(StatusCodes.Status200OK, (int)result.StatusCode);
            Assert.Equal(organizationResult.OrganizationNumber, result.Value.OrganizationNumber);

        }

        [Fact]
        public async Task GetOrganizationDetails_ReturnsNotFound()
        {
            var orgNumber = "123456789";

            var apiClient = CreateApiClientWithMockResponse(HttpStatusCode.NotFound, null);

            var result = await apiClient.FetchOrganizationDetails(orgNumber);

            Assert.False(result.IsSuccess);
            Assert.Null(result.Value);
            Assert.Equal(StatusCodes.Status404NotFound, (int)result.StatusCode);
        }

        [Fact]
        public async Task GetOrganizationDetails_ReturnsGone()
        {
            var orgNumber = "123456789";

            var apiClient = CreateApiClientWithMockResponse(HttpStatusCode.Gone, null);

            var result = await apiClient.FetchOrganizationDetails(orgNumber);

            Assert.False(result.IsSuccess);
            Assert.Null(result.Value);
            Assert.Equal(StatusCodes.Status410Gone, (int)result.StatusCode);
        }

        [Fact]
        public async Task GetOrganizationDetails_ReturnsInternalServerError()
        {
            var orgNumber = "123456789";

            var apiClient = CreateApiClientWithMockResponse(HttpStatusCode.InternalServerError, null);

            var result = await apiClient.FetchOrganizationDetails(orgNumber);

            Assert.False(result.IsSuccess);
            Assert.Null(result.Value);
            Assert.Equal(StatusCodes.Status500InternalServerError, (int)result.StatusCode);
        }

        private BrregApiClient CreateApiClientWithMockResponse(HttpStatusCode statusCode, object? content)
        {
            _handlerMock.Reset();
            _handlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = statusCode,
                    Content = new StringContent(JsonConvert.SerializeObject(content))
                });

            var httpClient = new HttpClient(_handlerMock.Object)
            {
                BaseAddress = new Uri("https://data.brreg.no/enhetsregisteret/api/")
            };

            return new BrregApiClient(httpClient);
        }
    }
}
