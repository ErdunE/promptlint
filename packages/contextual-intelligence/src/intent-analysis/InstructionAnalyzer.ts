/**
 * Level 4 Contextual Intelligence - Instruction Analyzer
 * 
 * Primary instruction layer analysis - what the user wants done
 * Week 1 Phase 4.1 Core Implementation
 */

import { 
  InstructionIntent,
  IntentCategory,
  ActionType,
  ActionSubject,
  SubjectType,
  SubjectComplexity,
  OutputFormat,
  IntentComplexity,
  IntentTaxonomy,
  ComplexityIndicator,
  ComplexityFactor,
  ComplexityImpact
} from '../shared/IntentTypes.js';

// === Core Instruction Analysis Engine ===

/**
 * Analyzes primary instruction layer to determine user intent
 */
export class InstructionAnalyzer {
  private intentPatterns: IntentPattern[] = [];
  private complexityAnalyzer: ComplexityAnalyzer;
  private taxonomyClassifier: TaxonomyClassifier;
  
  constructor() {
    this.complexityAnalyzer = new ComplexityAnalyzer();
    this.taxonomyClassifier = new TaxonomyClassifier();
    this.initializePatterns();
  }
  
  /**
   * Analyze instruction intent from user prompt
   */
  async analyzeInstruction(prompt: string): Promise<InstructionIntent> {
    const startTime = performance.now();
    
    try {
      // Step 1: Classify intent category
      const category = await this.classifyIntentCategory(prompt);
      
      // Step 2: Extract action type
      const action = await this.extractActionType(prompt, category);
      
      // Step 3: Identify action subject
      const subject = await this.identifyActionSubject(prompt, action);
      
      // Step 4: Determine output format preference
      const outputFormat = await this.determineOutputFormat(prompt, category, action);
      
      // Step 5: Assess complexity
      const complexity = await this.assessComplexity(prompt, category, action, subject);
      
      // Step 6: Calculate overall confidence
      const confidence = this.calculateConfidence(category, action, subject, outputFormat, complexity);
      
      const processingTime = performance.now() - startTime;
      
      // Log performance for Week 1 validation
      console.log(`[InstructionAnalyzer] Processing time: ${processingTime.toFixed(2)}ms`);
      
      return {
        category,
        action,
        subject,
        outputFormat,
        complexity,
        confidence
      };
      
    } catch (error) {
      console.error('[InstructionAnalyzer] Analysis failed:', error);
      return this.createFallbackIntent(prompt);
    }
  }
  
  /**
   * Get intent taxonomy classification
   */
  async getIntentTaxonomy(prompt: string): Promise<IntentTaxonomy> {
    return this.taxonomyClassifier.classify(prompt);
  }
  
  // === Private Analysis Methods ===
  
  private async classifyIntentCategory(prompt: string): Promise<IntentCategory> {
    const normalizedPrompt = prompt.toLowerCase();
    
    // Pattern-based classification with fallback strategies
    for (const pattern of this.intentPatterns) {
      if (pattern.matches(normalizedPrompt)) {
        return pattern.category;
      }
    }
    
    // Keyword-based fallback
    return this.classifyByKeywords(normalizedPrompt);
  }
  
  private async extractActionType(prompt: string, category: IntentCategory): Promise<ActionType> {
    const actionKeywords = this.getActionKeywords();
    const normalizedPrompt = prompt.toLowerCase();
    
    // Look for explicit action verbs
    for (const [action, keywords] of actionKeywords.entries()) {
      for (const keyword of keywords) {
        if (normalizedPrompt.includes(keyword)) {
          return action;
        }
      }
    }
    
    // Category-based fallback
    return this.getDefaultActionForCategory(category);
  }
  
  private async identifyActionSubject(prompt: string, action: ActionType): Promise<ActionSubject> {
    const subjectIndicators = this.extractSubjectIndicators(prompt);
    
    return {
      type: this.classifySubjectType(subjectIndicators),
      domain: this.extractDomain(prompt, subjectIndicators),
      complexity: this.assessSubjectComplexity(subjectIndicators),
      context: this.extractSubjectContext(prompt, subjectIndicators)
    };
  }
  
  private async determineOutputFormat(
    prompt: string, 
    category: IntentCategory, 
    action: ActionType
  ): Promise<OutputFormat> {
    const formatHints = this.extractFormatHints(prompt);
    
    if (formatHints.length > 0) {
      return formatHints[0]; // Use most confident format hint
    }
    
    // Category and action-based inference
    return this.inferFormatFromCategoryAndAction(category, action);
  }
  
  private async assessComplexity(
    prompt: string,
    category: IntentCategory,
    action: ActionType,
    subject: ActionSubject
  ): Promise<IntentComplexity> {
    const indicators = this.complexityAnalyzer.analyze(prompt, category, action, subject);
    return this.complexityAnalyzer.calculateOverallComplexity(indicators);
  }
  
  // === Pattern Matching and Classification ===
  
  private initializePatterns(): void {
    this.intentPatterns = [
      // Creation patterns
      new IntentPattern(
        IntentCategory.CREATE,
        ['create', 'make', 'build', 'generate', 'develop', 'design', 'construct'],
        ['new', 'from scratch', 'fresh']
      ),
      
      // Analysis patterns  
      new IntentPattern(
        IntentCategory.ANALYZE,
        ['analyze', 'examine', 'study', 'investigate', 'review', 'assess'],
        ['data', 'code', 'performance', 'results']
      ),
      
      // Code patterns
      new IntentPattern(
        IntentCategory.CODE,
        ['code', 'program', 'implement', 'write code', 'develop'],
        ['function', 'class', 'algorithm', 'script', 'application']
      ),
      
      // Problem solving patterns
      new IntentPattern(
        IntentCategory.SOLVE,
        ['solve', 'fix', 'resolve', 'troubleshoot', 'debug'],
        ['problem', 'issue', 'bug', 'error', 'challenge']
      ),
      
      // Learning patterns
      new IntentPattern(
        IntentCategory.EXPLAIN,
        ['explain', 'teach', 'show', 'demonstrate', 'clarify'],
        ['how', 'why', 'what', 'concept', 'principle']
      ),
      
      // Writing patterns
      new IntentPattern(
        IntentCategory.WRITE,
        ['write', 'compose', 'draft', 'author', 'document'],
        ['article', 'report', 'documentation', 'guide', 'content']
      )
    ];
  }
  
  private classifyByKeywords(prompt: string): IntentCategory {
    const categoryKeywords = new Map<IntentCategory, string[]>([
      [IntentCategory.CREATE, ['create', 'make', 'build', 'generate']],
      [IntentCategory.ANALYZE, ['analyze', 'examine', 'study', 'review']],
      [IntentCategory.CODE, ['code', 'program', 'implement', 'function']],
      [IntentCategory.SOLVE, ['solve', 'fix', 'resolve', 'debug']],
      [IntentCategory.EXPLAIN, ['explain', 'teach', 'show', 'how']],
      [IntentCategory.WRITE, ['write', 'compose', 'document', 'draft']]
    ]);
    
    let bestMatch = IntentCategory.CREATE; // Default fallback
    let maxMatches = 0;
    
    for (const [category, keywords] of categoryKeywords.entries()) {
      const matches = keywords.filter(keyword => prompt.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = category;
      }
    }
    
    return bestMatch;
  }
  
  private getActionKeywords(): Map<ActionType, string[]> {
    return new Map([
      [ActionType.GENERATE, ['generate', 'create', 'produce', 'make']],
      [ActionType.BUILD, ['build', 'construct', 'assemble', 'develop']],
      [ActionType.EXAMINE, ['examine', 'analyze', 'study', 'investigate']],
      [ActionType.EVALUATE, ['evaluate', 'assess', 'judge', 'review']],
      [ActionType.CONVERT, ['convert', 'transform', 'change', 'translate']],
      [ActionType.REFACTOR, ['refactor', 'restructure', 'reorganize', 'improve']],
      [ActionType.ORGANIZE, ['organize', 'structure', 'arrange', 'sort']],
      [ActionType.ENHANCE, ['enhance', 'improve', 'optimize', 'upgrade']]
    ]);
  }
  
  private getDefaultActionForCategory(category: IntentCategory): ActionType {
    const categoryDefaults = new Map<IntentCategory, ActionType>([
      [IntentCategory.CREATE, ActionType.GENERATE],
      [IntentCategory.ANALYZE, ActionType.EXAMINE],
      [IntentCategory.CODE, ActionType.BUILD],
      [IntentCategory.SOLVE, ActionType.EVALUATE],
      [IntentCategory.EXPLAIN, ActionType.EXAMINE],
      [IntentCategory.WRITE, ActionType.COMPOSE]
    ]);
    
    return categoryDefaults.get(category) || ActionType.GENERATE;
  }
  
  // === Subject Analysis ===
  
  private extractSubjectIndicators(prompt: string): string[] {
    const indicators: string[] = [];
    const words = prompt.toLowerCase().split(/\s+/);
    
    // Look for technical terms, file extensions, frameworks, etc.
    const technicalPatterns = [
      /\.(js|ts|py|java|cpp|html|css|json|xml|sql)$/,
      /(react|angular|vue|node|python|java|javascript|typescript)/,
      /(database|api|frontend|backend|algorithm|data|system)/,
      /(function|class|method|variable|component|service)/
    ];
    
    words.forEach(word => {
      if (technicalPatterns.some(pattern => pattern.test(word))) {
        indicators.push(word);
      }
    });
    
    return indicators;
  }
  
  private classifySubjectType(indicators: string[]): SubjectType {
    const typePatterns = new Map<SubjectType, string[]>([
      [SubjectType.CODE, ['function', 'class', 'method', 'algorithm', 'script', '.js', '.py', '.java']],
      [SubjectType.DATA, ['database', 'data', 'json', 'csv', 'api', 'dataset']],
      [SubjectType.DOCUMENT, ['document', 'report', 'guide', 'documentation', 'readme']],
      [SubjectType.SYSTEM, ['system', 'architecture', 'infrastructure', 'deployment']],
      [SubjectType.PROCESS, ['process', 'workflow', 'procedure', 'methodology']],
      [SubjectType.DESIGN, ['design', 'ui', 'ux', 'interface', 'layout']],
      [SubjectType.CONTENT, ['content', 'article', 'blog', 'text', 'copy']]
    ]);
    
    for (const [type, patterns] of typePatterns.entries()) {
      if (indicators.some(indicator => 
        patterns.some(pattern => indicator.includes(pattern))
      )) {
        return type;
      }
    }
    
    return SubjectType.CONCEPT; // Default fallback
  }
  
  private extractDomain(prompt: string, indicators: string[]): string {
    const domainKeywords = [
      'web development', 'mobile development', 'data science', 'machine learning',
      'devops', 'frontend', 'backend', 'fullstack', 'database', 'api',
      'security', 'testing', 'deployment', 'analytics', 'ai', 'blockchain'
    ];
    
    const promptLower = prompt.toLowerCase();
    for (const domain of domainKeywords) {
      if (promptLower.includes(domain)) {
        return domain;
      }
    }
    
    // Infer from indicators
    if (indicators.some(i => i.includes('react') || i.includes('vue') || i.includes('angular'))) {
      return 'frontend development';
    }
    if (indicators.some(i => i.includes('node') || i.includes('express') || i.includes('api'))) {
      return 'backend development';
    }
    if (indicators.some(i => i.includes('data') || i.includes('analytics'))) {
      return 'data analysis';
    }
    
    return 'general development';
  }
  
  private assessSubjectComplexity(indicators: string[]): SubjectComplexity {
    const complexityScore = indicators.length + 
      (indicators.filter(i => i.includes('advanced') || i.includes('complex')).length * 2);
    
    if (complexityScore <= 1) return SubjectComplexity.SIMPLE;
    if (complexityScore <= 3) return SubjectComplexity.MODERATE;
    if (complexityScore <= 5) return SubjectComplexity.COMPLEX;
    return SubjectComplexity.EXPERT_LEVEL;
  }
  
  private extractSubjectContext(prompt: string, indicators: string[]): string[] {
    const context: string[] = [];
    
    // Extract context from surrounding words
    const words = prompt.split(/\s+/);
    indicators.forEach(indicator => {
      const index = words.findIndex(word => word.includes(indicator));
      if (index > 0) context.push(words[index - 1]);
      if (index < words.length - 1) context.push(words[index + 1]);
    });
    
    return [...new Set(context)]; // Remove duplicates
  }
  
  // === Output Format Detection ===
  
  private extractFormatHints(prompt: string): OutputFormat[] {
    const formatHints: OutputFormat[] = [];
    const promptLower = prompt.toLowerCase();
    
    const formatPatterns = new Map<OutputFormat, string[]>([
      [OutputFormat.BULLET_POINTS, ['bullet', 'list', 'points', '•', '-']],
      [OutputFormat.NUMBERED_LIST, ['numbered', 'steps', 'order', '1.', '2.']],
      [OutputFormat.TABLE, ['table', 'chart', 'grid', 'columns']],
      [OutputFormat.CODE_SNIPPET, ['code', 'snippet', 'example', 'function']],
      [OutputFormat.STEP_BY_STEP, ['step by step', 'tutorial', 'guide', 'instructions']],
      [OutputFormat.OUTLINE, ['outline', 'structure', 'overview', 'summary']],
      [OutputFormat.REPORT, ['report', 'analysis', 'detailed', 'comprehensive']]
    ]);
    
    for (const [format, patterns] of formatPatterns.entries()) {
      if (patterns.some(pattern => promptLower.includes(pattern))) {
        formatHints.push(format);
      }
    }
    
    return formatHints;
  }
  
  private inferFormatFromCategoryAndAction(category: IntentCategory, action: ActionType): OutputFormat {
    const categoryFormats = new Map<IntentCategory, OutputFormat>([
      [IntentCategory.CREATE, OutputFormat.CODE_SNIPPET],
      [IntentCategory.ANALYZE, OutputFormat.REPORT],
      [IntentCategory.CODE, OutputFormat.CODE_SNIPPET],
      [IntentCategory.SOLVE, OutputFormat.STEP_BY_STEP],
      [IntentCategory.EXPLAIN, OutputFormat.OUTLINE],
      [IntentCategory.WRITE, OutputFormat.PROSE]
    ]);
    
    return categoryFormats.get(category) || OutputFormat.PROSE;
  }
  
  // === Confidence Calculation ===
  
  private calculateConfidence(
    category: IntentCategory,
    action: ActionType,
    subject: ActionSubject,
    outputFormat: OutputFormat,
    complexity: IntentComplexity
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on clear indicators
    if (category !== IntentCategory.CREATE) confidence += 0.1; // Non-default category
    if (action !== ActionType.GENERATE) confidence += 0.1; // Non-default action
    if (subject.type !== SubjectType.CONCEPT) confidence += 0.15; // Specific subject type
    if (subject.domain !== 'general development') confidence += 0.1; // Specific domain
    if (outputFormat !== OutputFormat.PROSE) confidence += 0.1; // Specific format
    
    // Adjust for complexity (more complex = potentially less confident)
    const complexityAdjustment = {
      [IntentComplexity.TRIVIAL]: 0.1,
      [IntentComplexity.SIMPLE]: 0.05,
      [IntentComplexity.MODERATE]: 0,
      [IntentComplexity.COMPLEX]: -0.05,
      [IntentComplexity.EXPERT]: -0.1
    };
    
    confidence += complexityAdjustment[complexity];
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }
  
  // === Fallback Implementation ===
  
  private createFallbackIntent(prompt: string): InstructionIntent {
    return {
      category: IntentCategory.CREATE,
      action: ActionType.GENERATE,
      subject: {
        type: SubjectType.CONCEPT,
        domain: 'general',
        complexity: SubjectComplexity.MODERATE,
        context: []
      },
      outputFormat: OutputFormat.PROSE,
      complexity: IntentComplexity.MODERATE,
      confidence: 0.3
    };
  }
}

// === Supporting Classes ===

class IntentPattern {
  constructor(
    public category: IntentCategory,
    public primaryKeywords: string[],
    public contextKeywords: string[]
  ) {}
  
  matches(prompt: string): boolean {
    const hasPrimary = this.primaryKeywords.some(keyword => prompt.includes(keyword));
    const hasContext = this.contextKeywords.length === 0 || 
      this.contextKeywords.some(keyword => prompt.includes(keyword));
    
    return hasPrimary && hasContext;
  }
}

class ComplexityAnalyzer {
  analyze(
    prompt: string,
    category: IntentCategory,
    action: ActionType,
    subject: ActionSubject
  ): ComplexityIndicator[] {
    const indicators: ComplexityIndicator[] = [];
    
    // Analyze scope complexity
    const scopeImpact = this.analyzeScopeComplexity(prompt);
    indicators.push({
      factor: ComplexityFactor.SCOPE,
      impact: scopeImpact,
      confidence: 0.8
    });
    
    // Analyze depth complexity
    const depthImpact = this.analyzeDepthComplexity(prompt, subject);
    indicators.push({
      factor: ComplexityFactor.DEPTH,
      impact: depthImpact,
      confidence: 0.7
    });
    
    // Analyze ambiguity
    const ambiguityImpact = this.analyzeAmbiguity(prompt);
    indicators.push({
      factor: ComplexityFactor.AMBIGUITY,
      impact: ambiguityImpact,
      confidence: 0.6
    });
    
    return indicators;
  }
  
  calculateOverallComplexity(indicators: ComplexityIndicator[]): IntentComplexity {
    const weightedScore = indicators.reduce((sum, indicator) => {
      const impactScore = this.getImpactScore(indicator.impact);
      return sum + (impactScore * indicator.confidence);
    }, 0) / indicators.length;
    
    if (weightedScore < 1.5) return IntentComplexity.TRIVIAL;
    if (weightedScore < 2.5) return IntentComplexity.SIMPLE;
    if (weightedScore < 3.5) return IntentComplexity.MODERATE;
    if (weightedScore < 4.5) return IntentComplexity.COMPLEX;
    return IntentComplexity.EXPERT;
  }
  
  private analyzeScopeComplexity(prompt: string): ComplexityImpact {
    const scopeIndicators = ['multiple', 'several', 'many', 'all', 'entire', 'complete'];
    const matches = scopeIndicators.filter(indicator => prompt.toLowerCase().includes(indicator));
    
    if (matches.length === 0) return ComplexityImpact.MINIMAL;
    if (matches.length <= 1) return ComplexityImpact.LOW;
    if (matches.length <= 2) return ComplexityImpact.MODERATE;
    return ComplexityImpact.HIGH;
  }
  
  private analyzeDepthComplexity(prompt: string, subject: ActionSubject): ComplexityImpact {
    const depthIndicators = ['advanced', 'complex', 'sophisticated', 'detailed', 'comprehensive'];
    const matches = depthIndicators.filter(indicator => prompt.toLowerCase().includes(indicator));
    
    // Subject complexity also contributes
    let baseImpact = ComplexityImpact.LOW;
    if (subject.complexity === SubjectComplexity.COMPLEX) baseImpact = ComplexityImpact.MODERATE;
    if (subject.complexity === SubjectComplexity.EXPERT_LEVEL) baseImpact = ComplexityImpact.HIGH;
    
    const promptImpact = matches.length > 0 ? ComplexityImpact.MODERATE : ComplexityImpact.MINIMAL;
    
    return this.combineImpacts(baseImpact, promptImpact);
  }
  
  private analyzeAmbiguity(prompt: string): ComplexityImpact {
    const ambiguityIndicators = ['somehow', 'maybe', 'perhaps', 'might', 'could', 'should'];
    const clarityIndicators = ['specific', 'exact', 'precise', 'clear', 'definite'];
    
    const ambiguous = ambiguityIndicators.filter(indicator => prompt.toLowerCase().includes(indicator)).length;
    const clear = clarityIndicators.filter(indicator => prompt.toLowerCase().includes(indicator)).length;
    
    const netAmbiguity = ambiguous - clear;
    
    if (netAmbiguity <= -2) return ComplexityImpact.MINIMAL;
    if (netAmbiguity <= 0) return ComplexityImpact.LOW;
    if (netAmbiguity <= 2) return ComplexityImpact.MODERATE;
    return ComplexityImpact.HIGH;
  }
  
  private getImpactScore(impact: ComplexityImpact): number {
    const scores = {
      [ComplexityImpact.MINIMAL]: 1,
      [ComplexityImpact.LOW]: 2,
      [ComplexityImpact.MODERATE]: 3,
      [ComplexityImpact.HIGH]: 4,
      [ComplexityImpact.EXTREME]: 5
    };
    return scores[impact];
  }
  
  private combineImpacts(impact1: ComplexityImpact, impact2: ComplexityImpact): ComplexityImpact {
    const score1 = this.getImpactScore(impact1);
    const score2 = this.getImpactScore(impact2);
    const combined = Math.max(score1, score2);
    
    const impacts = [ComplexityImpact.MINIMAL, ComplexityImpact.LOW, ComplexityImpact.MODERATE, ComplexityImpact.HIGH, ComplexityImpact.EXTREME];
    return impacts[Math.min(combined - 1, impacts.length - 1)];
  }
}

class TaxonomyClassifier {
  async classify(prompt: string): Promise<IntentTaxonomy> {
    // Basic implementation for Week 1
    // Will be enhanced in subsequent phases
    return {
      primary: IntentCategory.CREATE,
      secondary: [],
      domainTags: this.extractDomainTags(prompt),
      complexityIndicators: []
    };
  }
  
  private extractDomainTags(prompt: string): string[] {
    const domainPatterns = [
      'web', 'mobile', 'data', 'ai', 'ml', 'backend', 'frontend',
      'database', 'api', 'security', 'testing', 'devops'
    ];
    
    return domainPatterns.filter(tag => 
      prompt.toLowerCase().includes(tag)
    );
  }
}
