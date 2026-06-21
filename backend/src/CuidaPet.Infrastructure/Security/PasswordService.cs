using CuidaPet.Application.Abstractions;
using Microsoft.AspNetCore.Identity;

namespace CuidaPet.Infrastructure.Security;

public sealed class PasswordService : IPasswordService
{
    private readonly PasswordHasher<object> _hasher = new();
    private static readonly object User = new();

    public string Hash(string password) => _hasher.HashPassword(User, password);

    public bool Verify(string passwordHash, string password) =>
        _hasher.VerifyHashedPassword(User, passwordHash, password) != PasswordVerificationResult.Failed;
}
