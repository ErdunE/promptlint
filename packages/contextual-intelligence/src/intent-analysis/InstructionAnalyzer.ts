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
    // Enhanced keyword patterns with priority weights and context
    const categoryPatterns = new Map<IntentCategory, {keywords: string[], contextWords: string[], weight: number}>([
      // High-priority problem solving patterns (production emergencies, bugs, fixes)
      [IntentCategory.SOLVE, {
        keywords: ['solve', 'fix', 'resolve', 'debug', 'troubleshoot', 'repair', 'issue', 'problem', 'bug', 'error', 'broken', 'failing', 'crash', 'emergency'],
        contextWords: ['production', 'urgent', 'critical', 'immediate', 'asap', 'help', 'stuck'],
        weight: 3.0 // Highest priority for urgent issues
      }],
      
      // Analysis and examination patterns
      [IntentCategory.ANALYZE, {
        keywords: ['analyze', 'examine', 'study', 'review', 'assess', 'evaluate', 'investigate', 'inspect', 'check'],
        contextWords: ['performance', 'data', 'results', 'metrics', 'statistics', 'report', 'comparison'],
        weight: 2.5
      }],
      
      // Learning and explanation patterns
      [IntentCategory.EXPLAIN, {
        keywords: ['explain', 'teach', 'show', 'demonstrate', 'clarify', 'help understand', 'learn', 'how does', 'what is', 'why'],
        contextWords: ['concept', 'principle', 'theory', 'beginner', 'tutorial', 'guide', 'understand'],
        weight: 2.5
      }],
      
      // Writing and documentation patterns
      [IntentCategory.WRITE, {
        keywords: ['write', 'compose', 'draft', 'author', 'document', 'documentation'],
        contextWords: ['article', 'report', 'guide', 'content', 'text', 'copy', 'documentation'],
        weight: 2.0
      }],
      
      // Code-specific patterns (distinct from general creation)
      [IntentCategory.CODE, {
        keywords: ['code', 'program', 'implement', 'function', 'class', 'method', 'algorithm'],
        contextWords: ['javascript', 'python', 'typescript', 'react', 'api', 'database', 'programming'],
        weight: 2.5
      }],
      
      // Creation patterns (now more specific and lower priority as fallback)
      [IntentCategory.CREATE, {
        keywords: ['create', 'make', 'build', 'generate', 'develop', 'design', 'construct'],
        contextWords: ['new', 'from scratch', 'fresh', 'component', 'system', 'application'],
        weight: 1.0 // Lower weight as fallback
      }]
    ]);
    
    let bestMatch = IntentCategory.CREATE; // Fallback only if no matches
    let maxScore = 0;
    let hasAnyMatch = false;
    
    for (const [category, pattern] of categoryPatterns.entries()) {
      let score = 0;
      
      // Count keyword matches with base weight
      const keywordMatches = pattern.keywords.filter(keyword => prompt.includes(keyword)).length;
      score += keywordMatches * pattern.weight;
      
      // Bonus for context words
      const contextMatches = pattern.contextWords.filter(word => prompt.includes(word)).length;
      score += contextMatches * (pattern.weight * 0.5);
      
      // Special boost for urgent/problem-solving indicators
      if (category === IntentCategory.SOLVE) {
        if (prompt.includes('production') || prompt.includes('urgent') || prompt.includes('emergency') || prompt.includes('critical')) {
          score += 5.0; // Strong boost for emergency situations
        }
        if (prompt.includes('not working') || prompt.includes('failing') || prompt.includes('broken')) {
          score += 3.0; // Boost for broken state indicators
        }
      }
      
      // Special boost for learning indicators
      if (category === IntentCategory.EXPLAIN) {
        if (prompt.startsWith('how') || prompt.startsWith('what') || prompt.startsWith('why') || prompt.includes('help me understand')) {
          score += 3.0; // Strong boost for question patterns
        }
      }
      
      if (score > 0) {
        hasAnyMatch = true;
      }
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = category;
      }
    }
    
    // Only use CREATE as fallback if no other category matched
    if (!hasAnyMatch) {
      console.log('[InstructionAnalyzer] No keyword matches found, using CREATE fallback');
    } else {
      console.log(`[InstructionAnalyzer] Best match: ${bestMatch} (score: ${maxScore.toFixed(1)})`);
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
    let confidence = 0.65; // Raised base confidence to target 70-85% range
    
    // Strong confidence boosts for clear indicators
    if (category !== IntentCategory.CREATE) confidence += 0.15; // Strong boost for non-default category
    if (action !== ActionType.GENERATE) confidence += 0.12; // Strong boost for specific actions
    if (subject.type !== SubjectType.CONCEPT) confidence += 0.1; // Specific subject type
    if (subject.domain !== 'general development' && subject.domain !== 'general') confidence += 0.08; // Specific domain
    if (outputFormat !== OutputFormat.PROSE) confidence += 0.05; // Format specificity
    
    // Complexity-based confidence adjustments (clearer complexity = higher confidence)
    const complexityAdjustment = {
      [IntentComplexity.TRIVIAL]: 0.08,   // Very clear simple tasks
      [IntentComplexity.SIMPLE]: 0.05,    // Clear simple tasks  
      [IntentComplexity.MODERATE]: 0,     // Neutral
      [IntentComplexity.COMPLEX]: 0.03,   // Complex but clear = slightly higher confidence
      [IntentComplexity.EXPERT]: 0.05     // Expert level usually has clear indicators
    };
    
    confidence += complexityAdjustment[complexity];
    
    // Additional confidence factors based on prompt characteristics
    // These would be calculated during analysis but simulated here
    
    // Ensure confidence stays in reasonable bounds, targeting 70-85% for clear prompts
    const finalConfidence = Math.max(0.3, Math.min(0.95, confidence));
    
    console.log(`[InstructionAnalyzer] Confidence calculation: base=0.65, category=${category}, final=${finalConfidence.toFixed(3)}`);
    
    return finalConfidence;
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
    console.log('[ComplexityAnalyzer] === Complexity Calculation Debug ===');
    console.log('[ComplexityAnalyzer] Indicators received:', indicators.length);
    
    let totalScore = 0;
    indicators.forEach((indicator, index) => {
      const impactScore = this.getImpactScore(indicator.impact);
      const weightedScore = impactScore * indicator.confidence;
      totalScore += weightedScore;
      console.log(`[ComplexityAnalyzer] Indicator ${index + 1}: ${indicator.factor} = ${indicator.impact} (score: ${impactScore}, confidence: ${indicator.confidence}, weighted: ${weightedScore.toFixed(2)})`);
    });
    
    const averageScore = totalScore / indicators.length;
    console.log('[ComplexityAnalyzer] Total score:', totalScore.toFixed(2));
    console.log('[ComplexityAnalyzer] Average score:', averageScore.toFixed(2));
    
    // Properly calibrated thresholds based on 1-5 impact scoring with 0.6-0.8 confidence
    // Expected ranges: SIMPLE ~1.5-2.0, MODERATE ~2.0-2.8, COMPLEX ~2.8-4.0+
    let complexity: IntentComplexity;
    if (averageScore < 1.4) {
      complexity = IntentComplexity.TRIVIAL;
      console.log('[ComplexityAnalyzer] 📊 Threshold: TRIVIAL (< 1.4)');
    } else if (averageScore < 2.0) {  // Narrowed range for simple tasks
      complexity = IntentComplexity.SIMPLE;
      console.log('[ComplexityAnalyzer] 📊 Threshold: SIMPLE (1.4 - 2.0)');
    } else if (averageScore < 2.8) {  // Narrowed range for moderate tasks
      complexity = IntentComplexity.MODERATE;
      console.log('[ComplexityAnalyzer] 📊 Threshold: MODERATE (2.0 - 2.8)');
    } else if (averageScore < 4.2) {  // Expanded range for complex tasks
      complexity = IntentComplexity.COMPLEX;
      console.log('[ComplexityAnalyzer] 📊 Threshold: COMPLEX (2.8 - 4.2)');
    } else {
      complexity = IntentComplexity.EXPERT;
      console.log('[ComplexityAnalyzer] 📊 Threshold: EXPERT (> 4.2)');
    }
    
    console.log(`[ComplexityAnalyzer] Final complexity: ${complexity} (score: ${averageScore.toFixed(2)})`);
    console.log('[ComplexityAnalyzer] === End Debug ===');
    
    return complexity;
  }
  
  private analyzeScopeComplexity(prompt: string): ComplexityImpact {
    const lowerPrompt = prompt.toLowerCase();
    console.log(`[ComplexityAnalyzer] SCOPE ANALYSIS for: "${prompt}"`);
    console.log(`[ComplexityAnalyzer] Lowercase prompt: "${lowerPrompt}"`);
    
    // Check for emergency/production indicators (high complexity)
    const emergencyIndicators = ['production', 'emergency', 'critical', 'urgent', 'asap', 'immediately', 'failing', 'broken', 'down', '503', 'server error', 'outage'];
    const emergencyMatches = emergencyIndicators.filter(indicator => lowerPrompt.includes(indicator));
    const hasEmergency = emergencyMatches.length > 0;
    
    // Check for scale indicators (high complexity)
    const scaleIndicators = ['100k', '1000k', 'concurrent', 'users', 'scale', 'high volume', 'load', 'traffic'];
    const scaleMatches = scaleIndicators.filter(indicator => lowerPrompt.includes(indicator));
    const hasScale = scaleMatches.length > 0;
    
    // Check for enterprise/system-level indicators (high complexity)
    const enterpriseIndicators = ['enterprise', 'system', 'architecture', 'scalable', 'oauth', 'authentication', 'security', 'deployment', 'microservice', 'microservices'];
    const enterpriseMatches = enterpriseIndicators.filter(indicator => lowerPrompt.includes(indicator));
    const hasEnterprise = enterpriseMatches.length > 0;
    
    console.log(`[ComplexityAnalyzer] Emergency matches: [${emergencyMatches.join(', ')}] (${hasEmergency})`);
    console.log(`[ComplexityAnalyzer] Scale matches: [${scaleMatches.join(', ')}] (${hasScale})`);
    console.log(`[ComplexityAnalyzer] Enterprise matches: [${enterpriseMatches.join(', ')}] (${hasEnterprise})`);
    
    // Check for simple single-task indicators (low complexity)
    const simpleIndicators = ['simple', 'basic', 'quick', 'small', 'single', 'one', 'just'];
    const simpleMatches = simpleIndicators.filter(indicator => lowerPrompt.includes(indicator));
    const hasSimple = simpleMatches.length > 0;
    
    // Check for function/method level tasks (typically simple unless specified otherwise)
    const functionLevelIndicators = ['function', 'method', 'component', 'helper'];
    const functionMatches = functionLevelIndicators.filter(indicator => lowerPrompt.includes(indicator));
    const isFunctionLevel = functionMatches.length > 0;
    
    // Check for broad scope indicators
    const scopeIndicators = ['multiple', 'several', 'many', 'all', 'entire', 'complete', 'comprehensive', 'full'];
    const scopeMatches = scopeIndicators.filter(indicator => lowerPrompt.includes(indicator));
    
    console.log(`[ComplexityAnalyzer] Simple matches: [${simpleMatches.join(', ')}] (${hasSimple})`);
    console.log(`[ComplexityAnalyzer] Function matches: [${functionMatches.join(', ')}] (${isFunctionLevel})`);
    console.log(`[ComplexityAnalyzer] Scope matches: [${scopeMatches.join(', ')}] (${scopeMatches.length})`);
    
    let finalImpact: ComplexityImpact;
    
    // Prioritize emergency/production scenarios - use EXTREME for critical situations
    if (hasEmergency && hasScale) {
      console.log('[ComplexityAnalyzer] 🚨🔥 Emergency + Scale scenario detected - EXTREME complexity');
      finalImpact = ComplexityImpact.EXTREME;
    }
    else if (hasEmergency) {
      console.log('[ComplexityAnalyzer] 🚨 Emergency scenario detected - HIGH complexity');
      finalImpact = ComplexityImpact.HIGH;
    }
    // Scale indicators (100k+ users, etc.) with enterprise = extreme
    else if (hasScale && hasEnterprise) {
      console.log('[ComplexityAnalyzer] 📈🏢 Scale + Enterprise detected - EXTREME complexity');
      finalImpact = ComplexityImpact.EXTREME;
    }
    // Scale indicators (100k+ users, etc.) indicate high complexity
    else if (hasScale) {
      console.log('[ComplexityAnalyzer] 📈 Scale indicators detected - HIGH complexity');
      finalImpact = ComplexityImpact.HIGH;
    }
    // Enterprise-level tasks are inherently complex
    else if (hasEnterprise) {
      console.log('[ComplexityAnalyzer] 🏢 Enterprise-level task detected - HIGH complexity');
      finalImpact = ComplexityImpact.HIGH;
    }
    // Simple/basic tasks should stay low complexity
    else if (hasSimple && scopeMatches.length === 0) {
      console.log('[ComplexityAnalyzer] ✅ Simple task detected - MINIMAL complexity');
      finalImpact = ComplexityImpact.MINIMAL;
    }
    // Function-level tasks are typically simple unless multiple functions
    else if (isFunctionLevel && scopeMatches.length === 0) {
      console.log('[ComplexityAnalyzer] 🔧 Single function/component task - LOW complexity');
      finalImpact = ComplexityImpact.LOW;
    }
    // Evaluate based on scope indicators
    else {
      if (scopeMatches.length === 0) {
        finalImpact = ComplexityImpact.MINIMAL;
        console.log('[ComplexityAnalyzer] 📝 No scope indicators - MINIMAL complexity');
      } else if (scopeMatches.length <= 1) {
        finalImpact = ComplexityImpact.LOW;
        console.log('[ComplexityAnalyzer] 📝 Limited scope - LOW complexity');
      } else if (scopeMatches.length <= 2) {
        finalImpact = ComplexityImpact.MODERATE;
        console.log('[ComplexityAnalyzer] 📝 Moderate scope - MODERATE complexity');
      } else {
        finalImpact = ComplexityImpact.HIGH;
        console.log('[ComplexityAnalyzer] 📝 Broad scope - HIGH complexity');
      }
    }
    
    console.log(`[ComplexityAnalyzer] SCOPE FINAL RESULT: ${finalImpact}`);
    return finalImpact;
  }
  
  private analyzeDepthComplexity(prompt: string, subject: ActionSubject): ComplexityImpact {
    const lowerPrompt = prompt.toLowerCase();
    
    // Enhanced depth indicators for enterprise/production scenarios
    const highDepthIndicators = ['enterprise-grade', 'production-ready', 'scalable', 'distributed', 'microservices', 'architecture', 'comprehensive', 'detailed'];
    const mediumDepthIndicators = ['advanced', 'complex', 'sophisticated', 'detailed', 'robust'];
    const basicDepthIndicators = ['simple', 'basic', 'quick', 'minimal'];
    
    const highMatches = highDepthIndicators.filter(indicator => lowerPrompt.includes(indicator));
    const mediumMatches = mediumDepthIndicators.filter(indicator => lowerPrompt.includes(indicator));
    const basicMatches = basicDepthIndicators.filter(indicator => lowerPrompt.includes(indicator));
    
    console.log(`[ComplexityAnalyzer] Depth analysis - High: ${highMatches.length}, Medium: ${mediumMatches.length}, Basic: ${basicMatches.length}`);
    
    // High-depth indicators override everything
    if (highMatches.length > 0) {
      console.log('[ComplexityAnalyzer] High-depth indicators found - HIGH impact');
      return ComplexityImpact.HIGH;
    }
    
    // Basic indicators suggest low complexity
    if (basicMatches.length > 0 && mediumMatches.length === 0) {
      console.log('[ComplexityAnalyzer] Basic indicators found - LOW impact');
      return ComplexityImpact.LOW;
    }
    
    // Subject complexity also contributes
    let baseImpact = ComplexityImpact.LOW;
    if (subject.complexity === SubjectComplexity.COMPLEX) baseImpact = ComplexityImpact.MODERATE;
    if (subject.complexity === SubjectComplexity.EXPERT_LEVEL) baseImpact = ComplexityImpact.HIGH;
    
    const promptImpact = mediumMatches.length > 0 ? ComplexityImpact.MODERATE : ComplexityImpact.MINIMAL;
    
    const finalImpact = this.combineImpacts(baseImpact, promptImpact);
    console.log(`[ComplexityAnalyzer] Depth complexity final: ${finalImpact} (base: ${baseImpact}, prompt: ${promptImpact})`);
    
    return finalImpact;
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
