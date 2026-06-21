using CuidaPet.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CuidaPet.Infrastructure.Persistence;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(120).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(180).IsRequired();
        builder.Property(x => x.PasswordHash).HasMaxLength(500).IsRequired();
        builder.HasIndex(x => x.Email).IsUnique();
    }
}

public sealed class PetConfiguration : IEntityTypeConfiguration<Pet>
{
    public void Configure(EntityTypeBuilder<Pet> builder)
    {
        builder.ToTable("pets");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Species).HasMaxLength(60).IsRequired();
        builder.Property(x => x.Breed).HasMaxLength(100);
        builder.Property(x => x.WeightKg).HasPrecision(8, 2);
        builder.Property(x => x.PhotoUrl).HasMaxLength(500);
        builder.Property(x => x.Notes).HasMaxLength(2000);
        builder.HasOne(x => x.User).WithMany(x => x.Pets).HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class MedicationConfiguration : IEntityTypeConfiguration<Medication>
{
    public void Configure(EntityTypeBuilder<Medication> builder)
    {
        builder.ToTable("medications");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(150).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.Unit).HasMaxLength(40).IsRequired();
        builder.HasIndex(x => x.Name).IsUnique();

        builder.HasData(
            new { Id = Guid.Parse("10000000-0000-0000-0000-000000000001"), Name = "Prednisolona", Description = "Medicamento de referência. Use somente conforme prescrição veterinária.", Unit = "ml" },
            new { Id = Guid.Parse("10000000-0000-0000-0000-000000000002"), Name = "Dipirona", Description = "Medicamento de referência. Use somente conforme prescrição veterinária.", Unit = "mg" },
            new { Id = Guid.Parse("10000000-0000-0000-0000-000000000003"), Name = "Antibiótico", Description = "Categoria de referência. Use somente conforme prescrição veterinária.", Unit = "comprimido" },
            new { Id = Guid.Parse("10000000-0000-0000-0000-000000000004"), Name = "Vermífugo", Description = "Categoria de referência. Use somente conforme prescrição veterinária.", Unit = "comprimido" },
            new { Id = Guid.Parse("10000000-0000-0000-0000-000000000005"), Name = "Suplemento", Description = "Categoria de referência. Use somente conforme orientação veterinária.", Unit = "ml" });
    }
}

public sealed class TreatmentConfiguration : IEntityTypeConfiguration<Treatment>
{
    public void Configure(EntityTypeBuilder<Treatment> builder)
    {
        builder.ToTable("treatments");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.MedicationName).HasMaxLength(150).IsRequired();
        builder.Property(x => x.Dose).HasPrecision(10, 3);
        builder.Property(x => x.DoseUnit).HasMaxLength(40).IsRequired();
        builder.Property(x => x.Instructions).HasMaxLength(2000);
        builder.Property(x => x.PrescribedBy).HasMaxLength(150);
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
        builder.HasOne(x => x.Pet).WithMany(x => x.Treatments).HasForeignKey(x => x.PetId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Medication).WithMany(x => x.Treatments).HasForeignKey(x => x.MedicationId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public sealed class DoseScheduleConfiguration : IEntityTypeConfiguration<DoseSchedule>
{
    public void Configure(EntityTypeBuilder<DoseSchedule> builder)
    {
        builder.ToTable("dose_schedules");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.Notes).HasMaxLength(2000);
        builder.HasIndex(x => new { x.TreatmentId, x.ScheduledAt }).IsUnique();
        builder.HasIndex(x => new { x.Status, x.ScheduledAt });
        builder.HasOne(x => x.Treatment).WithMany(x => x.DoseSchedules).HasForeignKey(x => x.TreatmentId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.AppliedByUser).WithMany().HasForeignKey(x => x.AppliedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
