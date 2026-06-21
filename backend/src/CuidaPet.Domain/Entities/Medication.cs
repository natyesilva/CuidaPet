using CuidaPet.Domain.Common;

namespace CuidaPet.Domain.Entities;

public sealed class Medication : Entity
{
    private Medication() { }

    public Medication(string name, string? description, string unit)
    {
        Name = name.Trim();
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        Unit = unit.Trim();
    }

    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Unit { get; private set; } = string.Empty;
    public ICollection<Treatment> Treatments { get; private set; } = new List<Treatment>();
}
