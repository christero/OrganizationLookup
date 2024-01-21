using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using OrganizationLookup.Server.Controllers;
using OrganizationLookup.Server.DTOs.Request;
using OrganizationLookup.Server.DTOs.Response;
using OrganizationLookup.Server.Services;

namespace OrganizationLookup.Server.UnitTests.Controllers
{
    public class OrganizationsControllerTests
    {
        private readonly OrganizationsController _controller;
        private readonly Mock<IOrganizationLookupService> _organizationLookupServiceMock;

        public OrganizationsControllerTests()
        {
            _organizationLookupServiceMock = new Mock<IOrganizationLookupService>();
            _controller = new OrganizationsController(_organizationLookupServiceMock.Object);
        }

        [Fact]
        public async Task LookupOrganizationsCsv_TooManyOrganizations_ReturnsBadRequest()
        {
            var request = new OrgLookupRequestDTO()
            {
                Organizations = Enumerable.Range(1, 10001)
                .Select(i => new OrganizationRequest { OrgNumber = i.ToString()})
                .ToList()
            };

            var result = await _controller.LookupOrganizations(request) as BadRequestObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status400BadRequest, result.StatusCode);
            Assert.Equal("The number of organizations in the request exceeds the limit of 10000.", result.Value);
        }

        [Fact]
        public async Task LookupOrganizationsCsv_ZeroOrganizations_ReturnsEmptyOrgLookupResponseDTO()
        {
            var request = new OrgLookupRequestDTO()
            {
                Organizations = new List<OrganizationRequest>()
            };

            var result = await _controller.LookupOrganizations(request) as OkObjectResult; 
            var response = result?.Value as OrgLookupResponseDTO;

            Assert.NotNull(result);
            Assert.NotNull(response);
            Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
            Assert.Null(response.Organizations);
        }
    }
}
