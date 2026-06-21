using CuidaPet.Application.Abstractions;
using CuidaPet.Domain.Entities;
using CuidaPet.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CuidaPet.Infrastructure.Persistence;

public sealed class UserRepository(CuidaPetDbContext context) : IUserRepository
{
    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken) =>
        context.Users.SingleOrDefaultAsync(x => x.Email == email, cancellationToken);

    public async Task AddAsync(User user, CancellationToken cancellationToken) =>
        await context.Users.AddAsync(user, cancellationToken);
}

public sealed class PetRepository(CuidaPetDbContext context) : IPetRepository
{
    public async Task<IReadOnlyList<Pet>> ListByUserAsync(Guid userId, CancellationToken cancellationToken) =>
        await context.Pets.AsNoTracking().Where(x => x.UserId == userId).OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

    public Task<Pet?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        context.Pets.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task AddAsync(Pet pet, CancellationToken cancellationToken) =>
        await context.Pets.AddAsync(pet, cancellationToken);

    public void Remove(Pet pet) => context.Pets.Remove(pet);
}

public sealed class MedicationRepository(CuidaPetDbContext context) : IMedicationRepository
{
    public async Task<IReadOnlyList<Medication>> ListAsync(CancellationToken cancellationToken) =>
        await context.Medications.AsNoTracking().OrderBy(x => x.Name).ToListAsync(cancellationToken);

    public Task<Medication?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        context.Medications.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken) =>
        context.Medications.AnyAsync(x => x.Name.ToLower() == name.ToLower(), cancellationToken);

    public async Task AddAsync(Medication medication, CancellationToken cancellationToken) =>
        await context.Medications.AddAsync(medication, cancellationToken);
}

public sealed class TreatmentRepository(CuidaPetDbContext context) : ITreatmentRepository
{
    public async Task<IReadOnlyList<Treatment>> ListByUserAsync(Guid userId, CancellationToken cancellationToken) =>
        await context.Treatments.AsNoTracking()
            .Include(x => x.Pet)
            .Where(x => x.Pet.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

    public Task<Treatment?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken) =>
        context.Treatments
            .Include(x => x.Pet)
            .Include(x => x.DoseSchedules)
            .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task AddAsync(Treatment treatment, CancellationToken cancellationToken) =>
        await context.Treatments.AddAsync(treatment, cancellationToken);
}

public sealed class DoseScheduleRepository(CuidaPetDbContext context) : IDoseScheduleRepository
{
    public async Task<IReadOnlyList<DoseSchedule>> ListTodayByUserAsync(
        Guid userId,
        DateTimeOffset day,
        CancellationToken cancellationToken)
    {
        var start = new DateTimeOffset(day.Date, day.Offset);
        var end = start.AddDays(1);
        return await BaseQuery()
            .AsNoTracking()
            .Where(x => x.Treatment.Pet.UserId == userId && x.ScheduledAt >= start && x.ScheduledAt < end)
            .OrderBy(x => x.ScheduledAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<DoseSchedule>> ListPendingByUserAsync(
        Guid userId,
        CancellationToken cancellationToken) =>
        await BaseQuery()
            .AsNoTracking()
            .Where(x => x.Treatment.Pet.UserId == userId && x.Status == DoseScheduleStatus.Pending)
            .OrderBy(x => x.ScheduledAt)
            .Take(100)
            .ToListAsync(cancellationToken);

    public Task<DoseSchedule?> GetByIdWithTreatmentAsync(Guid id, CancellationToken cancellationToken) =>
        BaseQuery().SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

    private IQueryable<DoseSchedule> BaseQuery() =>
        context.DoseSchedules.Include(x => x.Treatment).ThenInclude(x => x.Pet);
}
