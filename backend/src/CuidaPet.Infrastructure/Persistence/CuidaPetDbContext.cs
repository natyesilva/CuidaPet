using CuidaPet.Application.Abstractions;
using CuidaPet.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CuidaPet.Infrastructure.Persistence;

public sealed class CuidaPetDbContext(DbContextOptions<CuidaPetDbContext> options)
    : DbContext(options), IUnitOfWork
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Pet> Pets => Set<Pet>();
    public DbSet<Medication> Medications => Set<Medication>();
    public DbSet<Treatment> Treatments => Set<Treatment>();
    public DbSet<DoseSchedule> DoseSchedules => Set<DoseSchedule>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CuidaPetDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
