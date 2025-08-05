// Enhanced AI prompts for AmperReach demo

const generateEmailPrompt = (lead, accountData = null) => {
  const basePrompt = `You are AmperReach, an AI specialized in writing highly personalized B2B sales emails that achieve 127% higher response rates.

LEAD INFORMATION:
- Name: ${lead.firstname} ${lead.lastname}
- Title: ${lead.title}
- Company: ${lead.company}
- Email: ${lead.email}
${accountData ? `
COMPANY CONTEXT:
- Industry: ${accountData.industry}
- Website: ${accountData.website}
` : ''}

WRITING GUIDELINES:
1. Research Simulation: Make 2-3 specific, believable observations about their company (recent news, industry trends, common challenges for their role)
2. Personalization: Reference something unique about their situation - avoid generic statements
3. Value Proposition: Connect their specific challenge to how we help similar companies
4. Social Proof: Mention 1-2 relevant companies in their industry (make them realistic)
5. Call to Action: Soft, specific, and time-bound (e.g., "15-minute call next Tuesday")

TONE: Professional but conversational. Write like a knowledgeable peer, not a salesperson.

FORMAT YOUR RESPONSE EXACTLY AS THIS JSON:
{
  "subject": "compelling subject line that references something specific",
  "body": "full email text with proper formatting and line breaks",
  "score": 85,
  "insights": [
    "Specific observation about their company",
    "Industry challenge referenced",
    "Personalization technique used"
  ]
}`;

  return basePrompt;
};

// Industry-specific templates for even better personalization
const industryTemplates = {
  'Technology': {
    challenges: ['scaling infrastructure', 'technical debt', 'deployment velocity'],
    companies: ['Stripe', 'Shopify', 'Datadog'],
    metrics: ['deployment time', 'system uptime', 'MTTR']
  },
  'Financial Services': {
    challenges: ['regulatory compliance', 'real-time processing', 'security'],
    companies: ['Robinhood', 'Coinbase', 'Square'],
    metrics: ['transaction latency', 'compliance overhead', 'fraud detection']
  },
  'Healthcare': {
    challenges: ['HIPAA compliance', 'data interoperability', 'patient outcomes'],
    companies: ['Teladoc', 'Oscar Health', 'Ro'],
    metrics: ['patient wait times', 'data processing', 'care coordination']
  },
  'Retail': {
    challenges: ['inventory management', 'omnichannel experience', 'peak traffic'],
    companies: ['Warby Parker', 'Allbirds', 'Glossier'],
    metrics: ['cart abandonment', 'page load time', 'inventory turnover']
  },
  'Education': {
    challenges: ['student engagement', 'platform reliability', 'content delivery'],
    companies: ['Coursera', 'Duolingo', 'Khan Academy'],
    metrics: ['student retention', 'course completion', 'platform uptime']
  }
};

// Title-based personalization
const titlePersonalization = {
  'VP': {
    focus: 'strategic initiatives and team scaling',
    pain: 'aligning technology with business objectives'
  },
  'Director': {
    focus: 'operational efficiency and team performance',
    pain: 'balancing innovation with stability'
  },
  'CTO': {
    focus: 'digital transformation and competitive advantage',
    pain: 'modernizing while maintaining business continuity'
  },
  'Head of': {
    focus: 'departmental goals and cross-functional alignment',
    pain: 'resource optimization and stakeholder management'
  },
  'Manager': {
    focus: 'team productivity and project delivery',
    pain: 'doing more with existing resources'
  }
};

module.exports = {
  generateEmailPrompt,
  industryTemplates,
  titlePersonalization
}; 