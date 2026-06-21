using CuidaPet.Domain.Common;

namespace CuidaPet.Domain.Entities;

public sealed class Pet : Entity
{
    private Pet() { }

    public Pet(
        Guid userId,
        string name,
        string species,
        string? breed,
        decimal weightKg,
        DateOnly? birthDate,
        string? photoUrl,
        string? notes)
    {
        UserId = userId;
        Update(name, species, breed, weightKg, birthDate, photoUrl, notes);
        CreatedAt = DateTimeOffset.UtcNow;
        UpdatedAt = CreatedAt;
    }

    public Guid UserId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Species { get; private set; } = string.Empty;
    public string? Breed { get; private set; }
    public decimal WeightKg { get; private set; }
    public DateOnly? BirthDate { get; private set; }
    public string? PhotoUrl { get; private set; }
    public string? Notes { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    public User User { get; private set; } = null!;
    public ICollection<Treatment> Treatments { get; private set; } = new List<Treatment>();

    public void Update(
        string name,
        string species,
        string? breed,
        decimal weightKg,
        DateOnly? birthDate,
        string? photoUrl,
        string? notes)
    {
        Name = name.Trim();
        Species = species.Trim();
        Breed = string.IsNullOrWhiteSpace(breed) ? null : breed.Trim();
        WeightKg = weightKg;
        BirthDate = birthDate;
        PhotoUrl = string.IsNullOrWhiteSpace(photoUrl) ? null : photoUrl.Trim();
        Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
