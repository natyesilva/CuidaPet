using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace CuidaPet.Api.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected Guid CurrentUserId
    {
        get
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(value, out var id)
                ? id
                : throw new UnauthorizedAccessException("Token sem identificação válida do usuário.");
        }
    }
}
