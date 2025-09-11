import { 
  ProjectContext,
  ProjectPhase,
  TechnicalStack,
  ProjectComplexity,
  IntentAnalysis 
} from '../shared/ContextualTypes.js';

export class ProjectContextAnalyzer {
  private workflowIndicators!: Map<ProjectPhase, string[]>;
  private technicalStackPatterns!: Map<string, RegExp[]>;
  private complexityFactors!: string[];

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    // Workflow stage indicators
    this.workflowIndicators = new Map([
      [ProjectPhase.PLANNING, [
        'design', 'plan', 'architecture', 'strategy', 'roadmap', 'requirements',
        'specification', 'analyze', 'research', 'evaluate', 'assess', 'outline'
      ]],
      [ProjectPhase.DEVELOPMENT, [
        'implement', 'build', 'create', 'code', 'develop', 'write', 'program',
        'construct', 'generate', 'make', 'setup', 'configure'
      ]],
      [ProjectPhase.TESTING, [
        'test', 'debug', 'verify', 'validate', 'check', 'fix', 'troubleshoot',
        'examine', 'review', 'quality', 'bug', 'error'
      ]],
      [ProjectPhase.DEPLOYMENT, [
        'deploy', 'release', 'publish', 'launch', 'production', 'live',
        'ship', 'deliver', 'rollout', 'go-live'
      ]],
      [ProjectPhase.MAINTENANCE, [
        'maintain', 'update', 'optimize', 'improve', 'enhance', 'refactor',
        'upgrade', 'patch', 'monitor', 'support'
      ]]
    ]);

    // Technical stack detection patterns
    this.technicalStackPatterns = new Map([
      // Languages
      ['JavaScript', [/\b(?:javascript|js|node|nodejs)\b/gi]],
      ['TypeScript', [/\b(?:typescript|ts)\b/gi]],
      ['Python', [/\bpython\b/gi]],
      ['Java', [/\bjava\b/gi]],
      ['C#', [/\bc#|csharp|\.net\b/gi]],
      ['Go', [/\b(?:golang|go)\b/gi]],
      ['Rust', [/\brust\b/gi]],
      ['PHP', [/\bphp\b/gi]],
      
      // Frontend Frameworks
      ['React', [/\breact\b/gi]],
      ['Vue', [/\bvue\b/gi]],
      ['Angular', [/\bangular\b/gi]],
      ['Svelte', [/\bsvelte\b/gi]],
      
      // Backend Frameworks
      ['Express', [/\bexpress\b/gi]],
      ['FastAPI', [/\bfastapi\b/gi]],
      ['Django', [/\bdjango\b/gi]],
      ['Flask', [/\bflask\b/gi]],
      ['Spring', [/\bspring\b/gi]],
      
      // Databases
      ['PostgreSQL', [/\b(?:postgresql|postgres)\b/gi]],
      ['MySQL', [/\bmysql\b/gi]],
      ['MongoDB', [/\bmongodb|mongo\b/gi]],
      ['Redis', [/\bredis\b/gi]],
      
      // Cloud Platforms
      ['AWS', [/\b(?:aws|amazon)\b/gi]],
      ['Azure', [/\bazure\b/gi]],
      ['GCP', [/\b(?:gcp|google cloud)\b/gi]],
      
      // Tools
      ['Docker', [/\bdocker\b/gi]],
      ['Kubernetes', [/\b(?:kubernetes|k8s)\b/gi]],
      ['Git', [/\bgit\b/gi]]
    ]);

    // Complexity assessment factors
    this.complexityFactors = [
      'scalable', 'distributed', 'microservices', 'enterprise', 'architecture',
      'system design', 'optimization', 'performance', 'security', 'authentication',
      'authorization', 'database', 'api', 'integration', 'concurrent', 'real-time',
      'high-availability', 'fault-tolerant', 'load-balancing', 'caching'
    ];
  }

  analyzeProjectContext(
    intentAnalysis: IntentAnalysis,
    prompt: string,
    historicalData?: any
  ): ProjectContext {
    const startTime = performance.now();

    try {
      const phase = this.detectProjectPhase(prompt, intentAnalysis);
      const technicalStack = this.inferTechnicalStack(prompt);
      const complexity = this.assessProjectComplexity(prompt);
      const timeline = this.estimateTimeline(prompt);
      const constraints = this.extractProjectConstraints(prompt);

      const confidence = this.calculateContextConfidence(
        phase, technicalStack, complexity, prompt
      );

      const processingTime = performance.now() - startTime;
      console.log(`[ProjectContextAnalyzer] Processing time: ${processingTime.toFixed(2)}ms`);

      return {
        projectType: 'GENERAL' as any, // Will be enhanced in future iterations
        stage: 'DEVELOPMENT' as any,
        phase,
        techStack: [], // Legacy field
        technicalStack,
        teamStructure: {
          size: 'INDIVIDUAL' as any,
          roles: [],
          experienceLevel: 'INTERMEDIATE' as any,
          workingStyle: 'HYBRID' as any
        },
        complexity,
        confidence,
        timeline,
        constraints
      };
    } catch (error) {
      console.error('[ProjectContextAnalyzer] Analysis failed:', error);
      return this.getFallbackContext();
    }
  }

  private detectProjectPhase(prompt: string, intentAnalysis: IntentAnalysis): ProjectPhase {
    const lowerPrompt = prompt.toLowerCase();
    let detectedPhase = ProjectPhase.DEVELOPMENT; // Default based on most common use case
    let maxScore = 0;

    // Score each phase based on keyword matches
    for (const [phase, indicators] of this.workflowIndicators) {
      const score = indicators.filter(indicator => 
        lowerPrompt.includes(indicator)
      ).length;
      
      if (score > maxScore) {
        maxScore = score;
        detectedPhase = phase;
      }
    }

    // Use intent analysis to refine phase detection
    const instructionCategory = intentAnalysis.instruction.category;
    if (maxScore === 0) {
      // Fallback to intent-based phase detection
      switch (instructionCategory) {
        case 'analyze':
        case 'explain':
          return ProjectPhase.PLANNING;
        case 'create':
        case 'code':
          return ProjectPhase.DEVELOPMENT;
        case 'solve':
          return ProjectPhase.TESTING;
        default:
          return ProjectPhase.DEVELOPMENT;
      }
    }

    return detectedPhase;
  }

  private inferTechnicalStack(prompt: string): TechnicalStack {
    const stack: TechnicalStack = {
      languages: [],
      frameworks: [],
      tools: [],
      platforms: []
    };

    // Detect technologies mentioned in prompt
    for (const [tech, patterns] of this.technicalStackPatterns) {
      for (const pattern of patterns) {
        if (pattern.test(prompt)) {
          // Categorize technology
          if (['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP'].includes(tech)) {
            stack.languages.push(tech);
          } else if (['React', 'Vue', 'Angular', 'Svelte', 'Express', 'FastAPI', 'Django', 'Flask', 'Spring'].includes(tech)) {
            stack.frameworks.push(tech);
          } else if (['Docker', 'Kubernetes', 'Git'].includes(tech)) {
            stack.tools.push(tech);
          } else if (['AWS', 'Azure', 'GCP', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis'].includes(tech)) {
            stack.platforms.push(tech);
          }
          break; // Avoid duplicates
        }
      }
    }

    return stack;
  }

  private assessProjectComplexity(prompt: string): ProjectComplexity {
    const lowerPrompt = prompt.toLowerCase();
    let complexityScore = 0;

    // Count complexity indicators
    complexityScore = this.complexityFactors.filter(factor => 
      lowerPrompt.includes(factor)
    ).length;

    // Additional heuristics
    if (lowerPrompt.includes('enterprise') || lowerPrompt.includes('production')) {
      complexityScore += 2;
    }
    if (lowerPrompt.includes('10k+') || lowerPrompt.includes('scale')) {
      complexityScore += 1;
    }

    // Map score to complexity level
    if (complexityScore >= 5) return ProjectComplexity.ENTERPRISE;
    if (complexityScore >= 3) return ProjectComplexity.HIGH;
    if (complexityScore >= 1) return ProjectComplexity.MEDIUM;
    return ProjectComplexity.LOW;
  }

  private estimateTimeline(prompt: string): any {
    const lowerPrompt = prompt.toLowerCase();
    
    // Timeline indicators
    const timelinePatterns = {
      immediate: /\b(?:now|immediately|asap|urgent)\b/gi,
      short: /\b(?:today|tomorrow|this week|by (?:tomorrow|friday))\b/gi,
      medium: /\b(?:next week|this month|by (?:next week|month end))\b/gi,
      long: /\b(?:next month|quarter|by (?:year end|q[1-4]))\b/gi
    };

    for (const [timeline, pattern] of Object.entries(timelinePatterns)) {
      if (pattern.test(prompt)) {
        return { urgency: timeline, confidence: 0.8 };
      }
    }

    return { urgency: 'medium', confidence: 0.3 }; // Default
  }

  private extractProjectConstraints(prompt: string): any[] {
    const constraints = [];
    const lowerPrompt = prompt.toLowerCase();

    // Performance constraints
    if (lowerPrompt.includes('10k+') || lowerPrompt.includes('concurrent') || lowerPrompt.includes('scalable')) {
      constraints.push({
        type: 'performance',
        description: 'High concurrency and scalability requirements',
        severity: 'high'
      });
    }

    // Security constraints
    if (lowerPrompt.includes('authentication') || lowerPrompt.includes('security') || lowerPrompt.includes('production')) {
      constraints.push({
        type: 'security',
        description: 'Security and authentication requirements',
        severity: 'high'
      });
    }

    // Integration constraints
    if (lowerPrompt.includes('existing') || lowerPrompt.includes('integrate') || lowerPrompt.includes('database')) {
      constraints.push({
        type: 'integration',
        description: 'Integration with existing systems required',
        severity: 'medium'
      });
    }

    return constraints;
  }

  private calculateContextConfidence(
    phase: ProjectPhase,
    stack: TechnicalStack,
    complexity: ProjectComplexity,
    prompt: string
  ): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence based on detected elements
    const totalTechDetected = stack.languages.length + stack.frameworks.length + 
                            stack.tools.length + stack.platforms.length;
    
    if (totalTechDetected > 0) confidence += 0.2;
    if (totalTechDetected >= 3) confidence += 0.1;
    
    // Phase detection confidence
    const lowerPrompt = prompt.toLowerCase();
    const phaseKeywords = this.workflowIndicators.get(phase) || [];
    const phaseMatches = phaseKeywords.filter(keyword => lowerPrompt.includes(keyword)).length;
    
    if (phaseMatches > 0) confidence += 0.2;
    if (phaseMatches >= 2) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private getFallbackContext(): ProjectContext {
    return {
      projectType: 'GENERAL' as any,
      stage: 'DEVELOPMENT' as any,
      phase: ProjectPhase.DEVELOPMENT,
      techStack: [],
      technicalStack: {
        languages: [],
        frameworks: [],
        tools: [],
        platforms: []
      },
      teamStructure: {
        size: 'INDIVIDUAL' as any,
        roles: [],
        experienceLevel: 'INTERMEDIATE' as any,
        workingStyle: 'HYBRID' as any
      },
      complexity: ProjectComplexity.LOW,
      confidence: 0.3,
      timeline: { urgency: 'medium', confidence: 0.3 },
      constraints: []
    };
  }
}
