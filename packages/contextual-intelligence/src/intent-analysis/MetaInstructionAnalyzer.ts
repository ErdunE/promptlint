import { 
  MetaInstructionAnalysis, 
  ProjectContext, 
  Constraint, 
  ExpertiseLevel,
  ProjectPhase,
  TechnicalStack,
  ProjectComplexity 
} from '../shared/ContextualTypes.js';
import { ConstraintType } from '../shared/IntentTypes.js';

export class MetaInstructionAnalyzer {
  private constraintPatterns!: Map<ConstraintType, RegExp[]>;
  private contextIndicators!: Map<ProjectPhase, string[]>;
  private expertiseMarkers!: Map<ExpertiseLevel, string[]>;

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    // Constraint detection patterns
    this.constraintPatterns = new Map([
      [ConstraintType.TIME, [
        /\b(?:by|before|within|deadline|urgent|asap|quickly|fast)\b/gi,
        /\b(?:today|tomorrow|this week|next week|end of)\b/gi
      ]],
      [ConstraintType.BUDGET, [
        /\b(?:free|cost|budget|cheap|expensive|affordable)\b/gi,
        /\b(?:limited resources|minimal cost|no budget)\b/gi
      ]],
      [ConstraintType.TECHNICAL, [
        /\b(?:using|with|in|must use|required|only|specific)\b/gi,
        /\b(?:framework|library|language|platform|tool)\b/gi
      ]],
      [ConstraintType.QUALITY, [
        /\b(?:production|enterprise|scalable|robust|secure)\b/gi,
        /\b(?:best practices|high quality|professional)\b/gi
      ]],
      [ConstraintType.SCOPE, [
        /\b(?:simple|basic|minimal|just|only|small)\b/gi,
        /\b(?:comprehensive|complete|full|detailed|extensive)\b/gi
      ]]
    ]);

    // Project context indicators
    this.contextIndicators = new Map([
      [ProjectPhase.PLANNING, ['design', 'plan', 'architecture', 'strategy', 'roadmap']],
      [ProjectPhase.DEVELOPMENT, ['implement', 'build', 'create', 'code', 'develop']],
      [ProjectPhase.TESTING, ['test', 'debug', 'fix', 'verify', 'validate']],
      [ProjectPhase.DEPLOYMENT, ['deploy', 'release', 'publish', 'launch', 'production']],
      [ProjectPhase.MAINTENANCE, ['update', 'maintain', 'optimize', 'improve', 'refactor']]
    ]);

    // Expertise level markers
    this.expertiseMarkers = new Map([
      [ExpertiseLevel.BEGINNER, ['new to', 'learning', 'basic', 'simple', 'help me understand']],
      [ExpertiseLevel.INTERMEDIATE, ['familiar with', 'experience with', 'know some', 'worked with']],
      [ExpertiseLevel.ADVANCED, ['expert in', 'deep knowledge', 'complex', 'advanced', 'optimize']],
      [ExpertiseLevel.EXPERT, ['architect', 'design patterns', 'best practices', 'scalable', 'enterprise']]
    ]);
  }

  analyzeMetaInstruction(prompt: string, context?: any): MetaInstructionAnalysis {
    const startTime = performance.now();
    
    try {
      const constraints = this.extractConstraints(prompt);
      const projectContext = this.inferProjectContext(prompt);
      const implicitRequirements = this.identifyImplicitRequirements(prompt);
      const expertiseLevel = this.determineExpertiseLevel(prompt);

      const processingTime = performance.now() - startTime;
      console.log(`[MetaInstructionAnalyzer] Processing time: ${processingTime.toFixed(2)}ms`);

      return {
        constraints,
        projectContext,
        implicitRequirements,
        userExpertiseLevel: expertiseLevel,
        confidence: this.calculateConfidence(constraints, projectContext, implicitRequirements),
        processingTime
      };
    } catch (error) {
      console.error('[MetaInstructionAnalyzer] Analysis failed:', error);
      return this.getFallbackAnalysis();
    }
  }

  private extractConstraints(prompt: string): Constraint[] {
    const constraints: Constraint[] = [];
    const lowerPrompt = prompt.toLowerCase();

    for (const [type, patterns] of this.constraintPatterns) {
      for (const pattern of patterns) {
        const matches = lowerPrompt.match(pattern);
        if (matches) {
          constraints.push({
            type,
            description: this.generateConstraintDescription(type, matches),
            severity: this.assessConstraintSeverity(type, matches),
            extractedFrom: matches[0]
          });
          break; // Only add one constraint per type to avoid duplicates
        }
      }
    }

    return constraints;
  }

  private inferProjectContext(prompt: string): ProjectContext {
    const lowerPrompt = prompt.toLowerCase();
    let detectedPhase = ProjectPhase.DEVELOPMENT; // Default
    let confidence = 0.5;

    // Detect project phase
    for (const [phase, indicators] of this.contextIndicators) {
      const matchCount = indicators.filter(indicator => 
        lowerPrompt.includes(indicator)
      ).length;
      
      if (matchCount > 0) {
        const phaseConfidence = Math.min(matchCount / indicators.length, 1.0);
        if (phaseConfidence > confidence) {
          detectedPhase = phase;
          confidence = phaseConfidence;
        }
      }
    }

    // Infer technical stack from prompt content
    const technicalStack = this.inferTechnicalStack(prompt);

    return {
      phase: detectedPhase,
      technicalStack,
      complexity: this.assessProjectComplexity(prompt),
      confidence
    };
  }

  private inferTechnicalStack(prompt: string): TechnicalStack {
    const lowerPrompt = prompt.toLowerCase();
    const stack: TechnicalStack = {
      languages: [],
      frameworks: [],
      tools: [],
      platforms: []
    };

    // Language detection
    const languagePatterns = {
      'JavaScript': /\b(?:javascript|js|node)\b/gi,
      'TypeScript': /\b(?:typescript|ts)\b/gi,
      'Python': /\bpython\b/gi,
      'Java': /\bjava\b/gi,
      'C++': /\bc\+\+\b/gi,
      'React': /\breact\b/gi,
      'Vue': /\bvue\b/gi,
      'Angular': /\bangular\b/gi
    };

    for (const [tech, pattern] of Object.entries(languagePatterns)) {
      if (pattern.test(prompt)) {
        if (['React', 'Vue', 'Angular'].includes(tech)) {
          stack.frameworks.push(tech);
        } else {
          stack.languages.push(tech);
        }
      }
    }

    return stack;
  }

  private identifyImplicitRequirements(prompt: string): string[] {
    const requirements: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // Common implicit requirements based on prompt patterns
    if (lowerPrompt.includes('production') || lowerPrompt.includes('enterprise')) {
      requirements.push('Error handling and validation required');
      requirements.push('Performance optimization expected');
      requirements.push('Security considerations needed');
    }

    if (lowerPrompt.includes('api') || lowerPrompt.includes('service')) {
      requirements.push('Input validation required');
      requirements.push('Error response handling needed');
    }

    if (lowerPrompt.includes('user') || lowerPrompt.includes('interface')) {
      requirements.push('User experience considerations');
      requirements.push('Accessibility compliance expected');
    }

    return requirements;
  }

  private determineExpertiseLevel(prompt: string): ExpertiseLevel {
    const lowerPrompt = prompt.toLowerCase();
    let detectedLevel = ExpertiseLevel.INTERMEDIATE; // Default
    let confidence = 0.5;

    for (const [level, markers] of this.expertiseMarkers) {
      const matchCount = markers.filter(marker => 
        lowerPrompt.includes(marker)
      ).length;
      
      if (matchCount > 0) {
        const levelConfidence = Math.min(matchCount / markers.length, 1.0);
        if (levelConfidence > confidence) {
          detectedLevel = level;
          confidence = levelConfidence;
        }
      }
    }

    return detectedLevel;
  }

  private generateConstraintDescription(type: ConstraintType, matches: RegExpMatchArray): string {
    const match = matches[0];
    switch (type) {
      case ConstraintType.TIME:
        return `Time constraint detected: "${match}"`;
      case ConstraintType.BUDGET:
        return `Budget constraint detected: "${match}"`;
      case ConstraintType.TECHNICAL:
        return `Technical constraint detected: "${match}"`;
      case ConstraintType.QUALITY:
        return `Quality constraint detected: "${match}"`;
      case ConstraintType.SCOPE:
        return `Scope constraint detected: "${match}"`;
      default:
        return `Constraint detected: "${match}"`;
    }
  }

  private assessConstraintSeverity(type: ConstraintType, matches: RegExpMatchArray): 'low' | 'medium' | 'high' {
    const match = matches[0].toLowerCase();
    
    // High severity indicators
    if (match.includes('urgent') || match.includes('asap') || match.includes('deadline')) {
      return 'high';
    }
    
    // Medium severity indicators
    if (match.includes('required') || match.includes('must') || match.includes('production')) {
      return 'medium';
    }
    
    return 'low';
  }

  private assessProjectComplexity(prompt: string): ProjectComplexity {
    const lowerPrompt = prompt.toLowerCase();
    let complexityScore = 0;

    // Complexity indicators
    const complexityMarkers = [
      'scalable', 'distributed', 'microservices', 'enterprise',
      'architecture', 'system design', 'optimization', 'performance',
      'security', 'authentication', 'database', 'api'
    ];

    complexityScore = complexityMarkers.filter(marker => 
      lowerPrompt.includes(marker)
    ).length;

    if (complexityScore >= 4) return ProjectComplexity.ENTERPRISE;
    if (complexityScore >= 2) return ProjectComplexity.HIGH;
    if (complexityScore >= 1) return ProjectComplexity.MEDIUM;
    return ProjectComplexity.LOW;
  }

  private calculateConfidence(
    constraints: Constraint[], 
    context: ProjectContext, 
    requirements: string[]
  ): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence based on detected elements
    if (constraints.length > 0) confidence += 0.2;
    if (context.confidence > 0.7) confidence += 0.2;
    if (requirements.length > 0) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private getFallbackAnalysis(): MetaInstructionAnalysis {
    return {
      constraints: [],
      projectContext: {
        phase: ProjectPhase.DEVELOPMENT,
        technicalStack: { languages: [], frameworks: [], tools: [], platforms: [] },
        complexity: ProjectComplexity.LOW,
        confidence: 0.3
      },
      implicitRequirements: [],
      userExpertiseLevel: ExpertiseLevel.INTERMEDIATE,
      confidence: 0.3,
      processingTime: 0
    };
  }
}
