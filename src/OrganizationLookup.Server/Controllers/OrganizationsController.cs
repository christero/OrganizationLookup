using Microsoft.AspNetCore.Mvc;
using OrganizationLookup.Server.DTOs.Request;
using OrganizationLookup.Server.DTOs.Response;
using OrganizationLookup.Server.Services;

namespace OrganizationLookup.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrganizationsController : ControllerBase
    {
        private readonly IOrganizationLookupService _organizationLookupService;
        private readonly ILogger _logger;

        public OrganizationsController(IOrganizationLookupService organizationLookupService, ILogger<OrganizationsController> logger)
        {
            _organizationLookupService = organizationLookupService;
            _logger = logger;
        }

        [HttpPost("lookup")]
        public async Task<IActionResult> LookupOrganizations([FromBody] OrgLookupRequestDTO request)
        {
            _logger.LogInformation($"LookupOrganizations: Received request");

            int maxAllowedOrganizations = 10000;

            if (request.Organizations?.Count > maxAllowedOrganizations)
            {
                return BadRequest($"The number of organizations in the request exceeds the limit of {maxAllowedOrganizations}.");
            }

            var orgNumbers = request.Organizations?.Select(o => o.OrgNumber);
            if (orgNumbers == null || orgNumbers.Any() == false)
            {
                return Ok(new OrgLookupResponseDTO());
            }

            try
            {
                var (organizations, errors) = await _organizationLookupService.GetOrganizationsDetails(orgNumbers);

                var response = new OrgLookupResponseDTO
                {
                    Organizations = organizations,
                    Errors = errors.Any() ? string.Join("\n", errors) : string.Empty,
                };

                _logger.LogInformation("LookupOrganizations: Request handled successfully");
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing the request.");
                return Problem("Internal Server Error");
            }
        }
    }
}
