import { ExtractedRequirement } from '../types';

export class RequirementProcessor {
  private static readonly FUNCTIONAL_KEYWORDS = [
    'user can', 'system should', 'application must', 'feature', 'functionality',
    'login', 'register', 'create', 'update', 'delete', 'search', 'filter',
    'navigate', 'display', 'show', 'hide', 'submit', 'validate'
  ];

  private static readonly NON_FUNCTIONAL_KEYWORDS = [
    'performance', 'security', 'usability', 'scalability', 'reliability',
    'availability', 'maintainability', 'portability', 'response time',
    'throughput', 'load time', 'concurrent users', 'uptime', 'backup'
  ];

  private static readonly CATEGORIES = {
    'Authentication': ['login', 'register', 'password', 'auth', 'signin', 'signup'],
    'User Management': ['user', 'profile', 'account', 'permissions', 'role'],
    'Data Processing': ['data', 'process', 'calculate', 'transform', 'validate'],
    'API Integration': ['api', 'integration', 'external', 'service', 'endpoint'],
    'Security': ['security', 'encrypt', 'decrypt', 'secure', 'protection'],
    'Performance': ['performance', 'speed', 'fast', 'optimize', 'cache'],
    'UI/UX': ['interface', 'design', 'layout', 'responsive', 'mobile', 'desktop'],
    'Reporting': ['report', 'analytics', 'dashboard', 'metrics', 'export']
  };

  static extractRequirements(text: string): ExtractedRequirement[] {
    const requirements: ExtractedRequirement[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    sentences.forEach((sentence, index) => {
      const lowerSentence = sentence.toLowerCase().trim();
      
      if (this.containsRequirementKeywords(lowerSentence)) {
        const requirement = this.createRequirement(sentence, index);
        if (requirement) {
          requirements.push(requirement);
        }
      }
    });

    return requirements;
  }

  private static containsRequirementKeywords(text: string): boolean {
    return [...this.FUNCTIONAL_KEYWORDS, ...this.NON_FUNCTIONAL_KEYWORDS]
      .some(keyword => text.includes(keyword));
  }

  private static createRequirement(text: string, index: number): ExtractedRequirement | null {
    const lowerText = text.toLowerCase();
    
    // Determine requirement type
    const isFunctional = this.FUNCTIONAL_KEYWORDS.some(keyword => lowerText.includes(keyword));
    const isNonFunctional = this.NON_FUNCTIONAL_KEYWORDS.some(keyword => lowerText.includes(keyword));
    
    if (!isFunctional && !isNonFunctional) {
      return null;
    }

    // Determine category
    const category = this.determineCategory(lowerText);
    
    // Determine priority based on keywords
    const priority = this.determinePriority(lowerText);

    // Generate acceptance criteria
    const acceptanceCriteria = this.generateAcceptanceCriteria(text, isFunctional);

    return {
      id: `req_${Date.now()}_${index}`,
      title: this.generateTitle(text),
      description: text.trim(),
      type: isFunctional ? 'functional' : 'non-functional',
      priority,
      category,
      acceptance_criteria: acceptanceCriteria,
      estimated_effort: 'TBD',
      dependencies: []
    };
  }

  private static determineCategory(text: string): string {
    for (const [category, keywords] of Object.entries(this.CATEGORIES)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }
    return 'General';
  }

  private static determinePriority(text: string): 'high' | 'medium' | 'low' {
    const highPriorityKeywords = ['critical', 'urgent', 'must', 'required', 'essential'];
    const lowPriorityKeywords = ['nice to have', 'optional', 'future', 'enhancement'];
    
    if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
      return 'high';
    }
    if (lowPriorityKeywords.some(keyword => text.includes(keyword))) {
      return 'low';
    }
    return 'medium';
  }

  private static generateTitle(text: string): string {
    const words = text.trim().split(' ');
    const maxWords = 8;
    let title = words.slice(0, maxWords).join(' ');
    
    if (words.length > maxWords) {
      title += '...';
    }
    
    return title;
  }

  private static generateAcceptanceCriteria(text: string, isFunctional: boolean): string[] {
    const criteria: string[] = [];
    
    if (isFunctional) {
      criteria.push('Feature behaves as described');
      criteria.push('All edge cases are handled appropriately');
      criteria.push('User interface is intuitive and accessible');
    } else {
      criteria.push('Performance meets specified requirements');
      criteria.push('System maintains stability under load');
      criteria.push('Quality attributes are measurable and testable');
    }
    
    return criteria;
  }

  static categorizeRequirements(requirements: ExtractedRequirement[]): Record<string, ExtractedRequirement[]> {
    const categorized: Record<string, ExtractedRequirement[]> = {};
    
    requirements.forEach(req => {
      if (!categorized[req.category]) {
        categorized[req.category] = [];
      }
      categorized[req.category].push(req);
    });
    
    return categorized;
  }

  static generateUserStory(requirement: ExtractedRequirement): string {
    const role = 'user';
    const want = requirement.description.toLowerCase().includes('system') ? 
      requirement.description.replace(/system/gi, 'I') : 
      `I want ${requirement.description}`;
    const so = 'I can achieve my goals efficiently';
    
    return `As a ${role}, ${want}, so that ${so}.`;
  }
}