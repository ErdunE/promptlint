/**
 * Semantic Analyzer - ES Module
 * 
 * Advanced semantic understanding for prompt analysis
 * Phase 1.3 Context-Aware Template Selection Implementation
 * Chrome Extension Compatible - Browser APIs Only
 */

import {
  PromptSemantics,
  IntentType,
  ComplexityLevel,
  CompletenessLevel,
  SpecificityLevel,
  ContextMarkers,
  SemanticAnalysisConfig
} from '../types/SemanticTypes.js';

export class SemanticAnalyzer {
  private config: SemanticAnalysisConfig;

  constructor(config?: Partial<SemanticAnalysisConfig>) {
    this.config = {
      enableIntentDetection: true,
      enableComplexityAssessment: true,
      enableCompletenessEvaluation: true,
      enableContextMarkers: true,
      maxProcessingTime: 30,
      confidenceThreshold: 60,
      ...config
    };
  }

  /**
   * Perform comprehensive semantic analysis of a prompt
   */
  analyze(prompt: string): PromptSemantics {
    const startTime = performance.now();
    
    if (!prompt || prompt.trim().length === 0) {
      return this.createEmptySemantics(startTime);
    }

    const cleanPrompt = prompt.toLowerCase().trim();
    const indicators: string[] = [];

    // Intent type detection
    const intentType = this.detectIntentType(cleanPrompt, indicators);
    
    // Complexity assessment
    const complexity = this.assessComplexity(cleanPrompt, indicators);
    
    // Completeness evaluation
    const completeness = this.evaluateCompleteness(cleanPrompt, indicators);
    
    // Specificity assessment
    const specificity = this.assessSpecificity(cleanPrompt, indicators);
    
    // Context markers detection
    const context = this.detectContextMarkers(cleanPrompt, indicators);
    
    // Calculate overall confidence
    const confidence = this.calculateSemanticConfidence(intentType, complexity, completeness, specificity, context);
    
    const processingTime = performance.now() - startTime;

    return {
      intentType,
      complexity,
      completeness,
      specificity,
      context,
      confidence,
      indicators,
      processingTime: Math.round(processingTime * 100) / 100
    };
  }

  /**
   * Detect intent type from prompt content
   */
  private detectIntentType(prompt: string, indicators: string[]): IntentType {
    // Explanatory patterns (moved before instructional to avoid conflicts)
    // But check for trailing explanatory clauses that should be deprioritized
    if (this.hasExplanatoryPatterns(prompt) && !this.hasTrailingExplanatoryClause(prompt)) {
      indicators.push('intent: explanatory patterns detected');
      return IntentType.EXPLANATORY;
    }

    // Investigative patterns (moved before instructional for multi-domain prompts)
    if (this.hasInvestigativePatterns(prompt)) {
      indicators.push('intent: investigative patterns detected');
      return IntentType.INVESTIGATIVE;
    }

    // Instructional patterns
    if (this.hasInstructionalPatterns(prompt)) {
      indicators.push('intent: instructional patterns detected');
      return IntentType.INSTRUCTIONAL;
    }

    // Creative patterns
    if (this.hasCreativePatterns(prompt)) {
      indicators.push('intent: creative patterns detected');
      return IntentType.CREATIVE;
    }

    // Comparative patterns (moved before analytical to catch comparison tasks)
    if (this.hasComparativePatterns(prompt)) {
      indicators.push('intent: comparative patterns detected');
      return IntentType.COMPARATIVE;
    }

    // Analytical patterns
    if (this.hasAnalyticalPatterns(prompt)) {
      indicators.push('intent: analytical patterns detected');
      return IntentType.ANALYTICAL;
    }

    // Planning patterns
    if (this.hasPlanningPatterns(prompt)) {
      indicators.push('intent: planning patterns detected');
      return IntentType.PLANNING;
    }

    // Debugging patterns
    if (this.hasDebuggingPatterns(prompt)) {
      indicators.push('intent: debugging patterns detected');
      return IntentType.DEBUGGING;
    }

    // Default to generative
    indicators.push('intent: generative (default)');
    return IntentType.GENERATIVE;
  }

  /**
   * Assess prompt complexity level
   */
  private assessComplexity(prompt: string, indicators: string[]): ComplexityLevel {
    const wordCount = prompt.split(/\s+/).length;
    const sentenceCount = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const hasMultipleTasks = this.countTasks(prompt);
    const hasTechnicalTerms = this.countTechnicalTerms(prompt);
    const hasConditionalLogic = this.hasConditionalLogic(prompt);

    let complexityScore = 0;

    // Word count factor
    if (wordCount > 50) complexityScore += 2;
    if (wordCount > 100) complexityScore += 2;

    // Sentence structure factor
    if (sentenceCount > 3) complexityScore += 1;
    if (sentenceCount > 6) complexityScore += 2;

    // Task complexity factor
    if (hasMultipleTasks > 1) complexityScore += 2;
    if (hasMultipleTasks > 3) complexityScore += 2;

    // Technical complexity factor
    if (hasTechnicalTerms > 3) complexityScore += 2;
    if (hasTechnicalTerms > 6) complexityScore += 2;

    // Conditional logic factor
    if (hasConditionalLogic) complexityScore += 3;

    // Determine complexity level
    if (complexityScore >= 8) {
      indicators.push(`complexity: expert (score: ${complexityScore})`);
      return ComplexityLevel.EXPERT;
    } else if (complexityScore >= 5) {
      indicators.push(`complexity: complex (score: ${complexityScore})`);
      return ComplexityLevel.COMPLEX;
    } else if (complexityScore >= 2) {
      indicators.push(`complexity: moderate (score: ${complexityScore})`);
      return ComplexityLevel.MODERATE;
    } else {
      indicators.push(`complexity: simple (score: ${complexityScore})`);
      return ComplexityLevel.SIMPLE;
    }
  }

  /**
   * Evaluate prompt completeness
   */
  private evaluateCompleteness(prompt: string, indicators: string[]): CompletenessLevel {
    const hasContext = this.hasContext(prompt);
    const hasRequirements = this.hasRequirements(prompt);
    const hasConstraints = this.hasConstraints(prompt);
    const hasOutputSpec = this.hasOutputSpecification(prompt);
    const hasExamples = this.hasExamples(prompt);
    const hasFormat = this.hasFormatSpecification(prompt);

    let completenessScore = 0;
    if (hasContext) completenessScore += 1;
    if (hasRequirements) completenessScore += 2;
    if (hasConstraints) completenessScore += 1;
    if (hasOutputSpec) completenessScore += 2;
    if (hasExamples) completenessScore += 1;
    if (hasFormat) completenessScore += 1;

    if (completenessScore >= 6) {
      indicators.push(`completeness: comprehensive (score: ${completenessScore})`);
      return CompletenessLevel.COMPREHENSIVE;
    } else if (completenessScore >= 4) {
      indicators.push(`completeness: detailed (score: ${completenessScore})`);
      return CompletenessLevel.DETAILED;
    } else if (completenessScore >= 2) {
      indicators.push(`completeness: partial (score: ${completenessScore})`);
      return CompletenessLevel.PARTIAL;
    } else {
      indicators.push(`completeness: minimal (score: ${completenessScore})`);
      return CompletenessLevel.MINIMAL;
    }
  }

  /**
   * Assess prompt specificity
   */
  private assessSpecificity(prompt: string, indicators: string[]): SpecificityLevel {
    const hasSpecificTerms = this.countSpecificTerms(prompt);
    const hasVagueTerms = this.countVagueTerms(prompt);
    const hasQuantifiers = this.countQuantifiers(prompt);
    const hasTechnicalSpecs = this.hasTechnicalSpecifications(prompt);

    let specificityScore = 0;
    specificityScore += hasSpecificTerms * 2;
    specificityScore += hasQuantifiers * 1;
    specificityScore += hasTechnicalSpecs ? 3 : 0;
    specificityScore -= hasVagueTerms * 1;

    if (specificityScore >= 8) {
      indicators.push(`specificity: precise (score: ${specificityScore})`);
      return SpecificityLevel.PRECISE;
    } else if (specificityScore >= 5) {
      indicators.push(`specificity: specific (score: ${specificityScore})`);
      return SpecificityLevel.SPECIFIC;
    } else if (specificityScore >= 2) {
      indicators.push(`specificity: general (score: ${specificityScore})`);
      return SpecificityLevel.GENERAL;
    } else {
      indicators.push(`specificity: vague (score: ${specificityScore})`);
      return SpecificityLevel.VAGUE;
    }
  }

  /**
   * Detect context markers
   */
  private detectContextMarkers(prompt: string, indicators: string[]): ContextMarkers {
    const context: ContextMarkers = {
      temporal: this.hasTemporalContext(prompt),
      conditional: this.hasConditionalContext(prompt),
      comparative: this.hasComparativeContext(prompt),
      sequential: this.hasSequentialContext(prompt),
      organizational: this.hasOrganizationalContext(prompt),
      technical: this.hasTechnicalContext(prompt),
      creative: this.hasCreativeContext(prompt),
      analytical: this.hasAnalyticalContext(prompt)
    };

    // Add indicators for detected contexts
    Object.entries(context).forEach(([key, value]) => {
      if (value) {
        indicators.push(`context: ${key}`);
      }
    });

    return context;
  }

  /**
   * Calculate overall semantic confidence
   */
  private calculateSemanticConfidence(
    intentType: IntentType,
    complexity: ComplexityLevel,
    completeness: CompletenessLevel,
    specificity: SpecificityLevel,
    context: ContextMarkers
  ): number {
    let confidence = 50; // Base confidence

    // Intent type confidence boost
    if (intentType !== IntentType.GENERATIVE) confidence += 10;

    // Complexity confidence boost
    if (complexity === ComplexityLevel.EXPERT || complexity === ComplexityLevel.COMPLEX) {
      confidence += 15;
    } else if (complexity === ComplexityLevel.MODERATE) {
      confidence += 10;
    }

    // Completeness confidence boost
    if (completeness === CompletenessLevel.COMPREHENSIVE) confidence += 15;
    else if (completeness === CompletenessLevel.DETAILED) confidence += 10;
    else if (completeness === CompletenessLevel.PARTIAL) confidence += 5;

    // Specificity confidence boost
    if (specificity === SpecificityLevel.PRECISE) confidence += 15;
    else if (specificity === SpecificityLevel.SPECIFIC) confidence += 10;
    else if (specificity === SpecificityLevel.GENERAL) confidence += 5;

    // Context markers confidence boost
    const contextCount = Object.values(context).filter(Boolean).length;
    confidence += contextCount * 3;

    return Math.min(100, Math.max(20, confidence));
  }

  // Pattern detection helper methods
  private hasInstructionalPatterns(prompt: string): boolean {
    const patterns = [
      'how to', 'how do i', 'how can i', 'show me', 'teach me',
      'create a', 'build a', 'implement', 'write a', 'make a', 'generate',
      'step by step', 'tutorial', 'guide', 'instructions'
    ];
    
    // Check for "build <artifact>" patterns (more flexible matching)
    const buildArtifactKeywords = {
      verbs: ['build', 'create', 'develop', 'make'],
      artifacts: ['website', 'app', 'application', 'system', 'component', 'interface', 'dashboard', 'tool', 'service', 'api', 'database', 'framework']
    };
    
    const hasBuildArtifact = buildArtifactKeywords.verbs.some(verb => {
      if (prompt.includes(verb)) {
        // Check if any artifact appears after the verb (allowing for adjectives in between)
        const verbIndex = prompt.indexOf(verb);
        const remainingPrompt = prompt.substring(verbIndex);
        return buildArtifactKeywords.artifacts.some(artifact => remainingPrompt.includes(artifact));
      }
      return false;
    });
    
    const hasBasicPattern = patterns.some(pattern => prompt.includes(pattern));
    
    return hasBasicPattern || hasBuildArtifact;
  }

  private hasCreativePatterns(prompt: string): boolean {
    const patterns = [
      'creative', 'story', 'poem', 'song', 'art', 'design', 'imagine',
      'brainstorm', 'ideas', 'inspiration', 'artistic', 'fictional',
      'character', 'plot', 'narrative', 'style', 'tone', 'engaging',
      'compelling', 'interesting', 'captivating', 'original', 'unique',
      'blog post', 'article', 'content', 'copy', 'marketing', 'creative writing'
    ];
    return patterns.some(pattern => prompt.includes(pattern));
  }

  private hasAnalyticalPatterns(prompt: string): boolean {
    const patterns = [
      'analyze', 'analysis', 'evaluate', 'assess', 'review', 'examine',
      'compare', 'contrast', 'pros and cons', 'advantages', 'disadvantages',
      'strengths', 'weaknesses', 'critique', 'criticism'
    ];
    return patterns.some(pattern => prompt.includes(pattern));
  }

  private hasComparativePatterns(prompt: string): boolean {
    const patterns = [
      'compare', 'contrast', 'versus', 'vs', 'difference between',
      'similar to', 'unlike', 'better than', 'worse than', 'prefer',
      'evaluate different', 'choose between', 'select between', 'decide between',
      'pros and cons', 'advantages and disadvantages', 'benefits and drawbacks',
      'which is better', 'which should', 'alternative to', 'options for',
      'different approaches', 'different methods', 'different solutions'
    ];
    return patterns.some(pattern => prompt.includes(pattern));
  }

  private hasPlanningPatterns(prompt: string): boolean {
    const patterns = [
      'plan', 'planning', 'outline', 'roadmap', 'strategy', 'timeline',
      'schedule', 'milestone', 'goal', 'objective', 'project',
      'organize', 'structure', 'framework', 'approach'
    ];
    return patterns.some(pattern => prompt.includes(pattern));
  }

  private hasDebuggingPatterns(prompt: string): boolean {
    const patterns = [
      'debug', 'fix', 'error', 'problem', 'issue', 'bug', 'troubleshoot',
      'solve', 'resolve', 'correct', 'repair', 'malfunction',
      'not working', 'broken', 'failed', 'exception'
    ];
    return patterns.some(pattern => prompt.includes(pattern));
  }

  private hasExplanatoryPatterns(prompt: string): boolean {
    const patterns = [
      'explain', 'what is', 'what are', 'define', 'describe', 'tell me about',
      'meaning of', 'purpose of', 'why', 'how does', 'how is',
      'clarify', 'elaborate', 'detail', 'information about',
      'document', 'documentation', 'document the', 'document how',
      'provide documentation', 'create documentation', 'write documentation',
      'outline the', 'summarize', 'overview of', 'description of'
    ];
    return patterns.some(pattern => prompt.includes(pattern));
  }

  private hasTrailingExplanatoryClause(prompt: string): boolean {
    // Check for explanatory verbs that appear as trailing clauses (after "and")
    const trailingPatterns = [
      'and document', 'and summarize', 'and explain', 'and describe',
      'and outline', 'and detail', 'and clarify', 'then document',
      'then summarize', 'then explain', 'then describe'
    ];
    
    // Also check if analytical/instructional verbs appear earlier
    const primaryVerbs = ['analyze', 'optimize', 'implement', 'build', 'create', 'develop', 'improve'];
    const hasEarlierPrimaryVerb = primaryVerbs.some(verb => prompt.includes(verb));
    
    const hasTrailingClause = trailingPatterns.some(pattern => prompt.includes(pattern));
    
    return hasTrailingClause && hasEarlierPrimaryVerb;
  }

  private hasInvestigativePatterns(prompt: string): boolean {
    const patterns = [
      'research', 'investigate', 'explore', 'find out', 'discover', 'study',
      'look into', 'examine', 'survey', 'gather information', 'collect data',
      'best practices', 'industry standards', 'methodologies', 'approaches',
      'solutions', 'options', 'alternatives', 'possibilities'
    ];
    return patterns.some(pattern => prompt.includes(pattern));
  }

  // Complexity assessment helpers
  private countTasks(prompt: string): number {
    const taskWords = ['create', 'build', 'implement', 'write', 'generate', 'develop', 'design', 'make', 'analyze', 'process'];
    return taskWords.filter(word => prompt.includes(word)).length;
  }

  private countTechnicalTerms(prompt: string): number {
    const technicalTerms = [
      'algorithm', 'api', 'database', 'framework', 'library', 'function', 'method',
      'class', 'object', 'variable', 'parameter', 'configuration', 'optimization',
      'performance', 'security', 'authentication', 'authorization', 'encryption'
    ];
    return technicalTerms.filter(term => prompt.includes(term)).length;
  }

  private hasConditionalLogic(prompt: string): boolean {
    const conditionals = ['if', 'when', 'unless', 'provided that', 'in case', 'assuming'];
    return conditionals.some(conditional => prompt.includes(conditional));
  }

  // Completeness evaluation helpers
  private hasContext(prompt: string): boolean {
    const contextWords = ['context', 'background', 'situation', 'environment', 'scenario'];
    return contextWords.some(word => prompt.includes(word));
  }

  private hasRequirements(prompt: string): boolean {
    const requirementWords = ['require', 'need', 'must', 'should', 'specification', 'criteria'];
    return requirementWords.some(word => prompt.includes(word));
  }

  private hasConstraints(prompt: string): boolean {
    const constraintWords = ['limit', 'constraint', 'restriction', 'boundary', 'within', 'maximum', 'minimum'];
    return constraintWords.some(word => prompt.includes(word));
  }

  private hasOutputSpecification(prompt: string): boolean {
    const outputWords = ['output', 'result', 'return', 'format', 'structure', 'deliverable'];
    return outputWords.some(word => prompt.includes(word));
  }

  private hasExamples(prompt: string): boolean {
    const exampleWords = ['example', 'sample', 'instance', 'illustration', 'demonstration'];
    return exampleWords.some(word => prompt.includes(word));
  }

  private hasFormatSpecification(prompt: string): boolean {
    const formatWords = ['format', 'style', 'template', 'structure', 'layout', 'presentation'];
    return formatWords.some(word => prompt.includes(word));
  }

  // Specificity assessment helpers
  private countSpecificTerms(prompt: string): number {
    const specificTerms = [
      'exactly', 'precisely', 'specifically', 'particular', 'specific', 'detailed',
      'comprehensive', 'thorough', 'complete', 'full', 'entire'
    ];
    return specificTerms.filter(term => prompt.includes(term)).length;
  }

  private countVagueTerms(prompt: string): number {
    const vagueTerms = [
      'something', 'anything', 'stuff', 'things', 'maybe', 'probably', 'kinda', 'sorta',
      'roughly', 'approximately', 'about', 'around', 'some', 'various', 'different'
    ];
    return vagueTerms.filter(term => prompt.includes(term)).length;
  }

  private countQuantifiers(prompt: string): number {
    const quantifiers = [
      'all', 'every', 'each', 'some', 'many', 'few', 'several', 'multiple',
      'single', 'one', 'two', 'three', 'first', 'second', 'last', 'final'
    ];
    return quantifiers.filter(quantifier => prompt.includes(quantifier)).length;
  }

  private hasTechnicalSpecifications(prompt: string): boolean {
    const techSpecs = [
      'version', 'size', 'length', 'width', 'height', 'duration', 'timeout',
      'limit', 'threshold', 'capacity', 'bandwidth', 'latency', 'throughput'
    ];
    return techSpecs.some(spec => prompt.includes(spec));
  }

  // Context marker detection helpers
  private hasTemporalContext(prompt: string): boolean {
    const temporalWords = ['time', 'when', 'before', 'after', 'during', 'while', 'schedule', 'timeline'];
    return temporalWords.some(word => prompt.includes(word));
  }

  private hasConditionalContext(prompt: string): boolean {
    const conditionalWords = ['if', 'when', 'unless', 'provided', 'assuming', 'condition'];
    return conditionalWords.some(word => prompt.includes(word));
  }

  private hasComparativeContext(prompt: string): boolean {
    const comparativeWords = ['compare', 'versus', 'vs', 'better', 'worse', 'similar', 'different'];
    return comparativeWords.some(word => prompt.includes(word));
  }

  private hasSequentialContext(prompt: string): boolean {
    const sequentialWords = ['first', 'second', 'then', 'next', 'finally', 'step', 'sequence', 'order'];
    return sequentialWords.some(word => prompt.includes(word));
  }

  private hasOrganizationalContext(prompt: string): boolean {
    const orgWords = ['organize', 'structure', 'plan', 'outline', 'framework', 'hierarchy', 'category'];
    return orgWords.some(word => prompt.includes(word));
  }

  private hasTechnicalContext(prompt: string): boolean {
    const techWords = ['technical', 'implementation', 'code', 'system', 'architecture', 'infrastructure'];
    return techWords.some(word => prompt.includes(word));
  }

  private hasCreativeContext(prompt: string): boolean {
    const creativeWords = ['creative', 'artistic', 'design', 'style', 'aesthetic', 'imagination'];
    return creativeWords.some(word => prompt.includes(word));
  }

  private hasAnalyticalContext(prompt: string): boolean {
    const analyticalWords = ['analysis', 'evaluation', 'assessment', 'review', 'examination', 'critique'];
    return analyticalWords.some(word => prompt.includes(word));
  }

  /**
   * Create empty semantics for invalid prompts
   */
  private createEmptySemantics(startTime: number): PromptSemantics {
    return {
      intentType: IntentType.GENERATIVE,
      complexity: ComplexityLevel.SIMPLE,
      completeness: CompletenessLevel.MINIMAL,
      specificity: SpecificityLevel.VAGUE,
      context: {
        temporal: false,
        conditional: false,
        comparative: false,
        sequential: false,
        organizational: false,
        technical: false,
        creative: false,
        analytical: false
      },
      confidence: 20,
      indicators: ['empty prompt'],
      processingTime: performance.now() - startTime
    };
  }
}
