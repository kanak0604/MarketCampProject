using MarketCampaignProject.Data;
using MarketCampaignProject.DTOs;
using MarketCampaignProject.Models;
using Microsoft.EntityFrameworkCore;

namespace MarketCampaignProject.Services
{
    public class LeadService
    {
        private readonly ApplicationDbContext _context;

        public LeadService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<LeadDto>> GetAllLeadsAsync()
        {
            return await _context.Leads
                .Select(l => new LeadDto
                {
                    LeadID = l.LeadID,
                    Name = l.Name,
                    Email = l.Email,
                    PhoneNumber = l.PhoneNumber,
                    CampaignAssignment = l.CampaignAssignment,
                    Segment = l.Segment
                })
                .ToListAsync();
        }

        public async Task<LeadDto?> GetLeadByIdAsync(int id)
        {
            var lead = await _context.Leads.FindAsync(id);
            if (lead == null) return null;

            return new LeadDto
            {
                LeadID = lead.LeadID,
                Name = lead.Name,
                Email = lead.Email,
                PhoneNumber = lead.PhoneNumber,
                CampaignAssignment = lead.CampaignAssignment,
                Segment = lead.Segment
            };
        }

        public async Task<(bool Success, string Message)> AddLeadAsync(LeadDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Email))
                return (false, "Name and Email are required.");

            var existing = await _context.Leads
                .FirstOrDefaultAsync(l => l.Email == dto.Email);

            if (existing != null)
                return (false, "Lead with this email already exists.");

            string segment = DetermineSegment(dto.Email, dto.CampaignAssignment, dto.PhoneNumber);

            var lead = new Lead
            {
                Name = dto.Name,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                CampaignAssignment = dto.CampaignAssignment,
                Segment = segment
            };

            _context.Leads.Add(lead);
            await _context.SaveChangesAsync();

            return (true, "Lead added successfully.");
        }

        public async Task<(bool Success, string Message)> UpdateLeadAsync(int id, LeadDto dto)
        {
            var lead = await _context.Leads.FindAsync(id);
            if (lead == null)
                return (false, "Lead not found.");

            lead.Name = dto.Name;
            lead.Email = dto.Email;
            lead.PhoneNumber = dto.PhoneNumber;
            lead.CampaignAssignment = dto.CampaignAssignment;
            lead.Segment = dto.Segment ?? lead.Segment;

            await _context.SaveChangesAsync();
            return (true, "Lead updated successfully.");
        }

        public async Task<(bool Success, string Message)> DeleteLeadAsync(int id)
        {
            var lead = await _context.Leads.FindAsync(id);
            if (lead == null)
                return (false, "Lead not found.");

            _context.Leads.Remove(lead);
            await _context.SaveChangesAsync();

            return (true, "Lead deleted successfully.");
        }

        private string DetermineSegment(string email, int? campaignId, string? phone)
        {
            string segment = "General";

            if (campaignId.HasValue)
            {
                var campaign = _context.Campaigns.FirstOrDefault(c => c.CampaignId == campaignId);
                if (campaign != null)
                {
                    if (campaign.CampaignName.Contains("Summer Sale", StringComparison.OrdinalIgnoreCase))
                        segment = "Seasonal";
                    else if (campaign.CampaignName.Contains("Corporate", StringComparison.OrdinalIgnoreCase))
                        segment = "Corporate";
                    else if (campaign.CampaignName.Contains("Launch", StringComparison.OrdinalIgnoreCase))
                        segment = "Early Adopters";
                }
            }

            if (email.EndsWith("@company.com", StringComparison.OrdinalIgnoreCase))
                segment = "Corporate Leads";
            else if (email.EndsWith("@edu.org", StringComparison.OrdinalIgnoreCase))
                segment = "Student/Academic";
            else if (email.EndsWith("@gmail.com", StringComparison.OrdinalIgnoreCase) ||
                     email.EndsWith("@yahoo.com", StringComparison.OrdinalIgnoreCase))
                segment = "General Public";

            if (!string.IsNullOrWhiteSpace(phone))
            {
                if (phone.StartsWith("+1")) segment = "US Leads";
                else if (phone.StartsWith("+91")) segment = "India Leads";
            }

            return segment;
        }
    }
}
