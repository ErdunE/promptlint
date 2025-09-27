import { 
  ContextualReasoning,
  ReasoningChain,
  ReasoningStep,
  ReasoningDocumentation 
} from '../shared/ContextualTypes.js';
import { IntentAnalysis } from '../shared/IntentTypes.js';

export class ReasoningChainGenerator {
  private reasoningPatterns!: Map<string, ReasoningPattern>;
  private logicValidators!: LogicValidator[];

  constructor() {
    this.initializeReasoningPatterns();
    this.initializeValidators();
  }

  private initializeReasoningPatterns(): void {
    this.reasoningPatterns = new Map([
      ['intent_analysis', {
        description: 'Analyze user intent across instruction, meta-instruction, and interaction layers',
        steps: ['identify_primary_task', 'extract_constraints', 'determine_communication_style'],
        confidence_factors: ['keyword_matching', 'pattern_recognition', 'context_consistency']
      }],
      ['contextual_analysis', {
        description: 'Understand project context and collaborative requirements',
        steps: ['detect_project_phase', 'assess_complexity', 'identify_team_context'],
        confidence_factors: ['technical_stack_detection', 'role_identification', 'collaboration_markers']
      }],
      ['template_selection', {
        description: 'Select optimal template based on comprehensive analysis',
        steps: ['evaluate_template_options', 'apply_context_filters', 'rank_by_appropriateness'],
        confidence_factors: ['context_alignment', 'user_preferences', 'platform_optimization']
      }],
      ['optimization_strategy', {
        description: 'Apply platform-specific and contextual optimizations',
        steps: ['platform_adaptation', 'contextual_enhancement', 'quality_validation'],
        confidence_factors: ['platform_compatibility', 'context_appropriateness', 'faithfulness_preservation']
      }]
    ]);
  }

  private initializeValidators(): void {
    this.logicValidators = [
      new FaithfulnessValidator(),
      new ConsistencyValidator(), 
      new CompletenessValidator(),
      new PerformanceValidator()
    ];
  }

  generateReasoningChain(
    intentAnalysis: IntentAnalysis,
    contextualReasoning: ContextualReasoning,
    templateOptions: any[]
  ): ReasoningChain {
    const startTime = performance.now();

    try {
      const steps: ReasoningStep[] = [];

      // Step 1: Intent Analysis Reasoning
      const intentStep = this.createIntentReasoningStep(intentAnalysis);
      steps.push(intentStep);

      // Step 2: Contextual Analysis Reasoning
      const contextualStep = this.createContextualReasoningStep(contextualReasoning);
      steps.push(contextualStep);

      // Step 3: Template Selection Reasoning
      const templateStep = this.createTemplateSelectionStep(
        intentAnalysis, 
        contextualReasoning, 
        templateOptions
      );
      steps.push(templateStep);

      // Step 4: Optimization Strategy Reasoning
      const optimizationStep = this.createOptimizationStep(
        intentAnalysis,
        contextualReasoning,
        (templateStep as any).selectedTemplate
      );
      steps.push(optimizationStep);

      const overallConfidence = this.calculateChainConfidence(steps);
      const documentation = this.generateDocumentation(steps);

      const processingTime = performance.now() - startTime;
      console.log(`[ReasoningChainGenerator] Processing time: ${processingTime.toFixed(2)}ms`);

      const reasoningChain: ReasoningChain = {
        steps,
        overallConfidence,
        documentation,
        processingTime,
        validated: this.validateReasoningChain(steps)
      };

      return reasoningChain;
    } catch (error) {
      console.error('[ReasoningChainGenerator] Chain generation failed:', error);
      return this.getFallbackReasoningChain();
    }
  }

  private createIntentReasoningStep(intentAnalysis: IntentAnalysis): ReasoningStep {
    const reasoning = {
      decision: `Identified primary intent as "${intentAnalysis.instruction.category}" with ${(intentAnalysis.confidence * 100).toFixed(1)}% confidence`,
      factors: [
        `Instruction layer: ${intentAnalysis.instruction.category} (${intentAnalysis.instruction.action})`,
        `Communication style: ${intentAnalysis.interaction.interactionStyle}`,
        `Constraints detected: ${intentAnalysis.metaInstruction.constraints.length}`,
        `User expertise: ${intentAnalysis.interaction.userExpertise}`
      ],
      confidence: intentAnalysis.confidence,
      alternatives: this.generateIntentAlternatives(intentAnalysis)
    };

    return {
      type: 'intent_analysis',
      reasoning,
      impact: 'high', // Intent analysis heavily influences template selection
      processingTime: intentAnalysis.performance.totalTime
    };
  }

  private createContextualReasoningStep(contextualReasoning: ContextualReasoning): ReasoningStep {
    const projectContext = contextualReasoning.projectContext;
    const collaborativeContext = contextualReasoning.collaborativeContext;

    const reasoning = {
      decision: `Context: ${projectContext.phase} phase, ${projectContext.complexity} complexity, ${collaborativeContext.collaborationLevel} collaboration`,
      factors: [
        `Project phase: ${projectContext.phase}`,
        `Complexity: ${projectContext.complexity}`,
        `Technical stack: ${this.formatTechnicalStack(projectContext.technicalStack)}`,
        `User role: ${collaborativeContext.roleContext}`,
        `Collaboration: ${collaborativeContext.collaborationLevel}`
      ],
      confidence: contextualReasoning.overallConfidence,
      alternatives: this.generateContextualAlternatives(contextualReasoning)
    };

    return {
      type: 'contextual_analysis',
      reasoning,
      impact: 'high', // Context heavily influences template customization
      processingTime: contextualReasoning.processingTime
    };
  }

  private createTemplateSelectionStep(
    intentAnalysis: IntentAnalysis,
    contextualReasoning: ContextualReasoning,
    templateOptions: any[]
  ): ReasoningStep & { selectedTemplate: any } {
    // Template selection logic based on intent and context
    const selectionCriteria = {
      intentCategory: intentAnalysis.instruction.category,
      projectComplexity: contextualReasoning.projectContext.complexity,
      communicationStyle: intentAnalysis.interaction.interactionStyle,
      detailLevel: 'balanced', // Default from interaction analysis
      collaborationLevel: contextualReasoning.collaborativeContext.collaborationLevel
    };

    const selectedTemplate = this.selectOptimalTemplate(selectionCriteria, templateOptions);
    const confidence = this.calculateTemplateSelectionConfidence(selectedTemplate, selectionCriteria);

    const reasoning = {
      decision: `Selected ${selectedTemplate.type} template based on ${selectionCriteria.intentCategory} intent and ${selectionCriteria.projectComplexity} complexity`,
      factors: [
        `Intent alignment: ${selectionCriteria.intentCategory} → ${selectedTemplate.type}`,
        `Complexity match: ${selectionCriteria.projectComplexity} project requires ${selectedTemplate.complexityLevel || 'standard'} structure`,
        `Communication fit: ${selectionCriteria.communicationStyle} style matches ${selectedTemplate.communicationStyle || 'neutral'} tone`,
        `Detail level: ${selectionCriteria.detailLevel} preference supports ${selectedTemplate.detailLevel || 'balanced'} verbosity`
      ],
      confidence,
      alternatives: templateOptions.filter(t => t.id !== selectedTemplate.id).map(t => ({
        template: t.type,
        reason: this.explainTemplateRejection(t, selectionCriteria)
      }))
    };

    return {
      type: 'template_selection',
      reasoning,
      impact: 'critical', // Template selection is the core output
      processingTime: 2, // Estimated processing time
      selectedTemplate
    } as ReasoningStep & { selectedTemplate: any };
  }

  private createOptimizationStep(
    intentAnalysis: IntentAnalysis,
    contextualReasoning: ContextualReasoning,
    selectedTemplate: any
  ): ReasoningStep {
    const optimizations = [];

    // Platform optimizations
    if (contextualReasoning.platformContext?.currentPlatform) {
      optimizations.push(`Platform-specific formatting for ${contextualReasoning.platformContext.currentPlatform}`);
    }

    // Context-based optimizations
    if (contextualReasoning.projectContext.complexity === 'enterprise') {
      optimizations.push('Enterprise-grade documentation and security considerations');
    }

    if (contextualReasoning.collaborativeContext.collaborationLevel === 'team') {
      optimizations.push('Team collaboration and shared standards integration');
    }

    // Communication style optimizations
    if (intentAnalysis.interaction.interactionStyle === 'technical') {
      optimizations.push('Technical terminology and precision optimization');
    }

    const reasoning = {
      decision: `Applied ${optimizations.length} contextual optimizations to enhance template relevance`,
      factors: optimizations.length > 0 ? optimizations : ['Baseline template optimization applied'],
      confidence: 0.85, // High confidence in optimization applicability
      alternatives: ['Minimal optimization (baseline template)', 'Maximum optimization (all available enhancements)']
    };

    return {
      type: 'optimization_strategy',
      reasoning,
      impact: 'medium', // Optimizations enhance but don't fundamentally change selection
      processingTime: 1 // Estimated processing time
    };
  }

  private selectOptimalTemplate(criteria: any, options: any[]): any {
    // Mock template selection logic - in real implementation would use sophisticated scoring
    if (options.length === 0) {
      return { id: 0, type: 'Default', complexityLevel: criteria.projectComplexity };
    }

    const templateScores = options.map(template => ({
      template,
      score: this.calculateTemplateScore(template, criteria)
    }));

    return templateScores.reduce((best, current) => 
      current.score > best.score ? current : best
    ).template;
  }

  private calculateTemplateScore(template: any, criteria: any): number {
    let score = 0.5; // Base score

    // Intent alignment scoring
    if (template.suitableFor?.includes(criteria.intentCategory)) {
      score += 0.3;
    }

    // Complexity alignment
    if (template.complexityLevel === criteria.projectComplexity) {
      score += 0.2;
    }

    // Communication style fit
    if (template.communicationStyle === criteria.communicationStyle) {
      score += 0.15;
    }

    // Detail level compatibility
    if (template.detailLevel === criteria.detailLevel) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  private calculateTemplateSelectionConfidence(template: any, criteria: any): number {
    const score = this.calculateTemplateScore(template, criteria);
    return Math.max(score, 0.6); // Minimum confidence threshold
  }

  private calculateChainConfidence(steps: ReasoningStep[]): number {
    const weights: Record<string, number> = {
      intent_analysis: 0.3,
      contextual_analysis: 0.3,
      template_selection: 0.25,
      optimization_strategy: 0.15
    };

    return steps.reduce((total, step) => {
      const weight = weights[step.type] || 0.1;
      return total + (step.reasoning.confidence * weight);
    }, 0);
  }

  private generateDocumentation(steps: ReasoningStep[]): ReasoningDocumentation {
    return {
      summary: `Template selection based on ${steps.length}-step reasoning chain`,
      keyDecisions: steps.map(step => ({
        step: step.type,
        decision: step.reasoning.decision,
        confidence: step.reasoning.confidence
      })),
      totalSteps: steps.length,
      confidenceScore: this.calculateChainConfidence(steps),
      executionTime: steps.reduce((total, step) => total + (step.processingTime || 0), 0)
    };
  }

  private validateReasoningChain(steps: ReasoningStep[]): boolean {
    return this.logicValidators.every(validator => validator.validate(steps));
  }

  private generateIntentAlternatives(intentAnalysis: IntentAnalysis): string[] {
    // Generate alternative intent interpretations
    const alternatives = [];
    if (intentAnalysis.instruction.confidence < 0.8) {
      alternatives.push('Alternative intent interpretations based on ambiguous keywords');
    }
    if (intentAnalysis.instruction.category === 'create') {
      alternatives.push('Could be interpreted as "analyze" or "explain" based on context');
    }
    return alternatives.length > 0 ? alternatives : ['High confidence in primary intent interpretation'];
  }

  private generateContextualAlternatives(contextualReasoning: ContextualReasoning): string[] {
    // Generate alternative contextual interpretations
    const alternatives = [];
    if (contextualReasoning.projectContext.confidence < 0.8) {
      alternatives.push('Alternative project phases or complexity assessments');
    }
    if (contextualReasoning.collaborativeContext.confidence < 0.8) {
      alternatives.push('Could be individual vs team context ambiguity');
    }
    return alternatives.length > 0 ? alternatives : ['High confidence in contextual assessment'];
  }

  private formatTechnicalStack(stack: any): string {
    const technologies = [
      ...stack.languages,
      ...stack.frameworks,
      ...stack.tools,
      ...stack.platforms
    ];
    return technologies.length > 0 ? technologies.join(', ') : 'None detected';
  }

  private explainTemplateRejection(template: any, criteria: any): string {
    return `${template.type} template less suitable for ${criteria.intentCategory} intent`;
  }

  private getFallbackReasoningChain(): ReasoningChain {
    return {
      steps: [{
        type: 'fallback',
        reasoning: {
          decision: 'Using fallback reasoning due to analysis failure',
          factors: ['System error occurred'],
          confidence: 0.3,
          alternatives: []
        },
        impact: 'low',
        processingTime: 0
      }],
      overallConfidence: 0.3,
      documentation: {
        summary: 'Fallback reasoning chain',
        keyDecisions: [],
        totalSteps: 1,
        confidenceScore: 0.3,
        executionTime: 0
      },
      processingTime: 0,
      validated: false
    };
  }
}

// Supporting interfaces and types
interface ReasoningPattern {
  description: string;
  steps: string[];
  confidence_factors: string[];
}

interface LogicValidator {
  validate(steps: ReasoningStep[]): boolean;
}

class FaithfulnessValidator implements LogicValidator {
  validate(steps: ReasoningStep[]): boolean {
    // Validate that reasoning preserves user intent
    return steps.every(step => step.reasoning.confidence > 0.3);
  }
}

class ConsistencyValidator implements LogicValidator {
  validate(steps: ReasoningStep[]): boolean {
    // Validate logical consistency between steps
    return true; // Implementation would check for contradictions
  }
}

class CompletenessValidator implements LogicValidator {
  validate(steps: ReasoningStep[]): boolean {
    // Validate that all necessary reasoning steps are present
    const requiredTypes = ['intent_analysis', 'contextual_analysis', 'template_selection'];
    return requiredTypes.every(type => steps.some(step => step.type === type));
  }
}

class PerformanceValidator implements LogicValidator {
  validate(steps: ReasoningStep[]): boolean {
    // Validate that reasoning chain completes within performance budget
    const totalTime = steps.reduce((sum, step) => sum + (step.processingTime || 0), 0);
    return totalTime < 100; // 100ms budget for reasoning chain
  }
}
