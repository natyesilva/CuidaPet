using CuidaPet.Domain.Entities;

namespace CuidaPet.Application.Abstractions;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken);
    Task AddAsync(User user, CancellationToken cancellationToken);
}

public interface IPetRepository
{
    Task<IReadOnlyList<Pet>> ListByUserAsync(Guid userId, CancellationToken cancellationToken);
    Task<Pet?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task AddAsync(Pet pet, CancellationToken cancellationToken);
    void Remove(Pet pet);
}

public interface IMedicationRepository
{
    Task<IReadOnlyList<Medication>> ListAsync(CancellationToken cancellationToken);
    Task<Medication?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken);
    Task AddAsync(Medication medication, CancellationToken cancellationToken);
}

public interface ITreatmentRepository
{
    Task<IReadOnlyList<Treatment>> ListByUserAsync(Guid userId, CancellationToken cancellationToken);
    Task<Treatment?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken);
    Task AddAsync(Treatment treatment, CancellationToken cancellationToken);
}

public interface IDoseScheduleRepository
{
    Task<IReadOnlyList<DoseSchedule>> ListTodayByUserAsync(Guid userId, DateTimeOffset day, CancellationToken cancellationToken);
    Task<IReadOnlyList<DoseSchedule>> ListPendingByUserAsync(Guid userId, CancellationToken cancellationToken);
    Task<DoseSchedule?> GetByIdWithTreatmentAsync(Guid id, CancellationToken cancellationToken);
}

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}

public interface IPasswordService
{
    string Hash(string password);
    bool Verify(string passwordHash, string password);
}

public interface ITokenService
{
    string Generate(User user);
}
