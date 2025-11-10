namespace MarketCampaignProject.Models
{
    public class Lead
    {
        public int LeadID { get; set; }             
        public string Name { get; set; }           
        public string Email { get; set; }           
        public string PhoneNumber { get; set; }     
        public int? CampaignAssignment { get; set; } 
        public string? Segment { get; set; }        
        public bool HasOpenedEmail { get; set; }      
        public bool HasConverted { get; set; }
    }
}
