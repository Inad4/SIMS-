using System.ComponentModel.DataAnnotations;

namespace SharedModels;


public enum RequestStatus
{
    PENDING,
    APPROVED,
    REJECTED,
    RETURNED
}


public class Request
{
    public int Id { get; set; }
    public string Message { get; set; } = null!;
    public RequestStatus Status { get; set; } = RequestStatus.PENDING;
    public DateTime? ReturnedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
    public DateTime? CreatedAt { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public ICollection<Equipment> Equipment { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public User User { get; set; } = null!;
    public DateTime RejectedAt { get; set; }
    public DateTime ApprovedAt { get; set; }
}
