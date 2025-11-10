using Microsoft.AspNetCore.Mvc;
using MarketCampaignProject.Data;
using MarketCampaignProject.Models;
using Microsoft.EntityFrameworkCore;

namespace MarketCampaignProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // controller base is the class of mvc which will be inherited to the CampaignController
    public class CampaignController : ControllerBase
    {
        //readonly means only initialized once 
        private readonly ApplicationDbContext _context;

        //constructor having parameter as AppDbContext and variable name as Context
        public CampaignController(ApplicationDbContext context)
            // put the property of Context so that the file can use it
        {
            _context = context;
        }

        [HttpGet]
        //in api async and await allows request to interact with database without blocking the server thread, so that multiple users can be served at a time
        public async Task<IActionResult> GetAllCampaigns(
            string? agency,
            string? buyer,
            string? brand,
            string? campaignName,
            DateTime? startDate,
            DateTime? endDate,
            string? status)
            //Asqueryable makes the database table into into iquerable object 
        {
            var query = _context.Campaigns.AsQueryable();

            if (!string.IsNullOrEmpty(agency))
            {
                query = query.Where(x => x.Agency == agency);
            }

            if (!string.IsNullOrEmpty(buyer))
            {
                query = query.Where(x => x.Buyer == buyer);
            }

            if (!string.IsNullOrEmpty(brand))
            {
                query = query.Where(x=> x.Brand == brand);
            }

            if (!string.IsNullOrEmpty(campaignName))
            {
                query = query.Where(x=> x.CampaignName.Contains(campaignName));
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(x=> x.Status == status);
            }

            if (startDate.HasValue && !endDate.HasValue)
            {
                query = query.Where(x=> x.StartDate >= startDate.Value);
            }
            else if (!startDate.HasValue && endDate.HasValue)
            {
                query = query.Where(x=> x.EndDate <= endDate.Value);
            }
            else if (startDate.HasValue && endDate.HasValue)
            {
                query = query.Where(x=> x.StartDate >= startDate.Value && x.EndDate <= endDate.Value);
            }

            var campaigns = await query.ToListAsync();

            if (campaigns.Count == 0)
            {
                return Ok(new { success = false, message = "No campaigns found" });
            }

            var campaignList = new List<object>();

            foreach (var c in campaigns)
            {
                //In lead table how many campassignment is equal to the id 
                var totalLeads = await _context.Leads.CountAsync(l=> l.CampaignAssignment == c.CampaignId);
                var openCount = await _context.Leads.CountAsync(l=> l.CampaignAssignment == c.CampaignId && l.HasOpenedEmail);
                var convertedCount = await _context.Leads.CountAsync(l=> l.CampaignAssignment == c.CampaignId && l.HasConverted);
                //inittialization value
                double openRate = 0;
                double conversionRate = 0;
                double clickThroughRate = 0;

                //calculation of open rate 
                if (totalLeads > 0)
                {
                    openRate = Math.Round((double)openCount / totalLeads * 100, 2);
                    conversionRate = Math.Round((double)convertedCount / totalLeads * 100, 2);
                }
                //calculation of clickthroughrate 
                if (openCount > 0)
                {
                    clickThroughRate = Math.Round((double)convertedCount / openCount * 100, 2);
                }
                //new is annouymous object for temporary storage of data in order to use for short period 
                campaignList.Add(new
                {
                    c.CampaignId,c.CampaignName,c.StartDate,c.EndDate,c.Status,c.Agency,c.Buyer,c.Brand,
                    TotalLeads = totalLeads,
                    OpenRate = openRate,
                    ConversionRate = conversionRate,
                    ClickThroughRate = clickThroughRate
                });
            }

            return Ok(new { success = true, data = campaignList });
        }

        [HttpGet("filters")]
        public async Task<IActionResult> GetFilters()
        {
            var agencies = await _context.Campaigns
                .Where(x => x.Agency != null)
                .Select(x => x.Agency)
                .Distinct()
                .ToListAsync();

            var buyers = await _context.Campaigns
                .Where(x => x.Buyer != null)
                .Select(x => x.Buyer)
                .Distinct()
                .ToListAsync();

            var brands = await _context.Campaigns
                .Where(x => x.Brand != null)
                .Select(x => x.Brand)
                .Distinct()
                .ToListAsync();

            return Ok(new { success = true, data = new { agencies, buyers, brands } });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCampaignById(int id)
        {
            var c = await _context.Campaigns.FindAsync(id);

            if (c == null)
            {
                return NotFound(new { success = false, message = "Campaign not found" });
            }

            var totalLeads = await _context.Leads.CountAsync(l => l.CampaignAssignment == c.CampaignId);
            var openCount = await _context.Leads.CountAsync(l => l.CampaignAssignment == c.CampaignId && l.HasOpenedEmail);
            var convertedCount = await _context.Leads.CountAsync(l => l.CampaignAssignment == c.CampaignId && l.HasConverted);

            double openRate = 0;
            double conversionRate = 0;
            double clickThroughRate = 0;

            if (totalLeads > 0)
            {
                openRate = Math.Round((double)openCount / totalLeads * 100, 2);
                conversionRate = Math.Round((double)convertedCount / totalLeads * 100, 2);
            }

            if (openCount > 0)
            {
                clickThroughRate = Math.Round((double)convertedCount / openCount * 100, 2);
            }

            return Ok(new
            {
                success = true,
                data = new
                {
                    c.CampaignId,
                    c.CampaignName,
                    c.StartDate,
                    c.EndDate,
                    c.Status,
                    c.Agency,
                    c.Buyer,
                    c.Brand,
                    TotalLeads = totalLeads,
                    OpenRate = openRate,
                    ConversionRate = conversionRate,
                    ClickThroughRate = clickThroughRate
                }
            });
        }

        [HttpPost]
        //FROMBODY - Attribute that tells the framework to to read the data from the Http Body and deserilize it  from json and bind it with the parameter in the funtion 
        public async Task<IActionResult> AddCampaign([FromBody] Campaign campaign)
        {
            if (campaign == null || string.IsNullOrWhiteSpace(campaign.CampaignName))
            {
                return BadRequest(new { success = false, message = "Campaign name is required" });
            }

            _context.Campaigns.Add(campaign);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Campaign added successfully", data = campaign });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCampaign(int id, [FromBody] Campaign updated)
        {
            var campaign = await _context.Campaigns.FindAsync(id);

            if (campaign == null)
            {
                return NotFound(new { success = false, message = "Campaign not found" });
            }

            campaign.CampaignName = updated.CampaignName;
            campaign.StartDate = updated.StartDate;
            campaign.EndDate = updated.EndDate;
            campaign.Status = updated.Status;
            campaign.Agency = updated.Agency;
            campaign.Buyer = updated.Buyer;
            campaign.Brand = updated.Brand;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Campaign updated successfully" });
        }

        [HttpDelete("{id}")]
        //Task is a return type of data and iactionresult is interface of representing http response
        public async Task<IActionResult> DeleteCampaign(int id)
        {
            var campaign = await _context.Campaigns.FindAsync(id);

            if (campaign == null)
            {
                return NotFound(new { success = false, message = "Campaign not found" });
            }

            _context.Campaigns.Remove(campaign);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Campaign deleted successfully" });
        }

        [HttpGet("averages")]
        public async Task<IActionResult> GetAverageMetrics()
        {
            var campaigns = await _context.Campaigns.ToListAsync();

            if (campaigns.Count == 0)
            {
                return Ok(new { success = false, message = "No campaigns found" });
            }

            double avgOpenRate = campaigns.Average(x => x.OpenRate);
            double avgConversionRate = campaigns.Average(x => x.ConversionRate);
            double avgClickThroughRate = campaigns.Average(x => x.ClickThroughRate);
            int totalLeads = campaigns.Sum(x => x.TotalLeads);

            return Ok(new
            {
                success = true,
                data = new
                {
                    AvgOpenRate = Math.Round(avgOpenRate, 2),
                    AvgConversionRate = Math.Round(avgConversionRate, 2),
                    AvgClickThroughRate = Math.Round(avgClickThroughRate, 2),
                    TotalLeads = totalLeads
                }
            });
        }
    }
}
