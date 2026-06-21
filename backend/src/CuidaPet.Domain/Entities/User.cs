using CuidaPet.Domain.Common;

namespace CuidaPet.Domain.Entities;

public sealed class User : Entity
{
    private User() { }

    public User(string name, string email, string passwordHash)
    {
        Name = name.Trim();
        Email = email.Trim().ToLowerInvariant();
        PasswordHash = passwordHash;
        CreatedAt = DateTimeOffset.UtcNow;
        UpdatedAt = CreatedAt;
    }

    public string Name { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    public ICollection<Pet> Pets { get; private set; } = new List<Pet>();
}
