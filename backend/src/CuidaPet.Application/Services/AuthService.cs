using CuidaPet.Application.Abstractions;
using CuidaPet.Application.Common.Exceptions;
using CuidaPet.Application.Contracts.Auth;
using CuidaPet.Domain.Entities;

namespace CuidaPet.Application.Services;

public sealed class AuthService(
    IUserRepository users,
    IPasswordService passwords,
    ITokenService tokens,
    IUnitOfWork unitOfWork)
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await users.GetByEmailAsync(email, cancellationToken) is not null)
            throw new ConflictException("Já existe uma conta cadastrada com este e-mail.");

        var user = new User(request.Name, email, passwords.Hash(request.Password));
        await users.AddAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new AuthResponse(user.Id, user.Name, user.Email, tokens.Generate(user));
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await users.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), cancellationToken);
        if (user is null || !passwords.Verify(user.PasswordHash, request.Password))
            throw new UnauthorizedException("E-mail ou senha inválidos.");

        return new AuthResponse(user.Id, user.Name, user.Email, tokens.Generate(user));
    }
}
