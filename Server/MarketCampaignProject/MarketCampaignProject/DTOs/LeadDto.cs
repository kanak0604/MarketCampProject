namespace MarketCampaignProject.DTOs
{
    public class LeadDto
    {
        public int LeadID { get; set; }                     
        public string Name { get; set; } = string.Empty;    
        public string Email { get; set; } = string.Empty;   
        public string? PhoneNumber { get; set; }            
        public int? CampaignAssignment { get; set; }        
        public string? Segment { get; set; }                
    }
}
