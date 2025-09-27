import { 
  ReferenceHistory,
  ProjectOptimizationHistory,
  UserOptimizationPatterns,
  LearningTrajectory,
  ReasoningChain 
} from '../shared/ContextualTypes.js';
import { IntentAnalysis } from '../shared/IntentTypes.js';

export class ReferenceHistoryManager {
  private historyCache!: Map<string, ReferenceHistory>;
  private patternDetectionThresholds!: PatternThresholds;
  private learningAnalytics!: LearningAnalytics;

  constructor() {
    this.historyCache = new Map();
    this.initializeThresholds();
    this.initializeLearningAnalytics();
  }

  private initializeThresholds(): void {
    this.patternDetectionThresholds = {
      minimumInteractions: 5,
      patternConfidenceThreshold: 0.7,
      learningRateThreshold: 0.1,
      stabilityThreshold: 0.8
    };
  }

  private initializeLearningAnalytics(): void {
    this.learningAnalytics = {
      preferenceStability: new Map(),
      improvementMetrics: new Map(),
      contextualRelevance: new Map()
    };
  }

  buildReferenceHistory(
    userId: string,
    projectId: string,
    recentInteractions: any[]
  ): ReferenceHistory {
    const startTime = performance.now();

    try {
      const projectHistory = this.analyzeProjectHistory(projectId, recentInteractions);
      const userPatterns = this.extractUserPatterns(userId, recentInteractions);
      const successfulInteractions = this.identifySuccessfulInteractions(recentInteractions);
      const learningTrajectory = this.calculateLearningTrajectory(userId, recentInteractions);

      const confidence = this.calculateHistoryConfidence(
        projectHistory, userPatterns, successfulInteractions
      );

      const processingTime = performance.now() - startTime;
      console.log(`[ReferenceHistoryManager] Processing time: ${processingTime.toFixed(2)}ms`);

      const referenceHistory: ReferenceHistory = {
        projectHistory,
        userPatterns,
        successfulInteractions,
        learningTrajectory,
        confidence,
        lastUpdated: Date.now(),
        processingTime
      };

      // Cache for future reference
      this.historyCache.set(`${userId}-${projectId}`, referenceHistory);

      return referenceHistory;
    } catch (error) {
      console.error('[ReferenceHistoryManager] History building failed:', error);
      return this.getFallbackHistory();
    }
  }

  private analyzeProjectHistory(projectId: string, interactions: any[]): ProjectOptimizationHistory {
    // Filter interactions for this project
    const projectInteractions = interactions.filter(i => i.projectId === projectId);
    
    // Analyze project-specific patterns
    const optimizationPatterns = this.extractOptimizationPatterns(projectInteractions);
    const templateEffectiveness = this.measureTemplateEffectiveness(projectInteractions);
    const evolutionTimeline = this.buildEvolutionTimeline(projectInteractions);

    return {
      projectId,
      totalInteractions: projectInteractions.length,
      optimizationPatterns,
      templateEffectiveness,
      evolutionTimeline,
      lastActive: Math.max(...projectInteractions.map(i => i.timestamp), 0)
    };
  }

  private extractUserPatterns(userId: string, interactions: any[]): UserOptimizationPatterns {
    // Analyze user behavior across all projects
    const templatePreferences = this.analyzeTemplatePreferences(interactions);
    const communicationStyle = this.inferCommunicationStyle(interactions);
    const expertiseProgression = this.trackExpertiseProgression(interactions);
    const domainFocus = this.identifyDomainFocus(interactions);

    return {
      userId,
      templatePreferences,
      communicationStyle,
      expertiseProgression,
      domainFocus,
      consistency: this.measurePatternConsistency(interactions),
      adaptationRate: this.calculateAdaptationRate(interactions)
    };
  }

  private identifySuccessfulInteractions(interactions: any[]): any[] {
    // Identify high-quality interactions for learning
    return interactions.filter(interaction => {
      const success = (interaction.userSatisfaction || 0) > 0.8 &&
                     (interaction.templateEffectiveness || 0) > 0.75 &&
                     (interaction.reasoningQuality || 0) > 0.7;
      
      return success;
    }).map(interaction => ({
      timestamp: interaction.timestamp,
      prompt: interaction.originalPrompt,
      reasoning: interaction.reasoningChain,
      template: interaction.selectedTemplate,
      outcome: interaction.outcome,
      successFactors: this.identifySuccessFactors(interaction)
    }));
  }

  private calculateLearningTrajectory(userId: string, interactions: any[]): LearningTrajectory {
    // Analyze user learning and improvement over time
    const chronologicalInteractions = interactions.sort((a, b) => a.timestamp - b.timestamp);
    
    const improvementMetrics = this.measureImprovement(chronologicalInteractions);
    const skillDevelopment = this.trackSkillDevelopment(chronologicalInteractions);
    const adaptationSpeed = this.calculateAdaptationSpeed(chronologicalInteractions);

    return {
      userId,
      improvementMetrics,
      skillDevelopment,
      adaptationSpeed,
      trajectoryConfidence: this.assessTrajectoryConfidence(improvementMetrics),
      predictedNeeds: this.predictFutureNeeds(skillDevelopment, adaptationSpeed)
    };
  }

  private extractOptimizationPatterns(interactions: any[]): any[] {
    // Extract successful optimization patterns from project interactions
    const patterns = [];
    
    // Template selection patterns
    const templateUsage = this.analyzeTemplateUsage(interactions);
    if (templateUsage.dominantTemplate) {
      patterns.push({
        type: 'template_preference',
        pattern: templateUsage.dominantTemplate,
        confidence: templateUsage.confidence,
        frequency: templateUsage.frequency
      });
    }

    // Contextual optimization patterns
    const contextPatterns = this.analyzeContextualPatterns(interactions);
    patterns.push(...contextPatterns);

    return patterns;
  }

  private measureTemplateEffectiveness(interactions: any[]): any {
    const templateMetrics = new Map();
    
    interactions.forEach(interaction => {
      const template = interaction.selectedTemplate?.type;
      if (template) {
        if (!templateMetrics.has(template)) {
          templateMetrics.set(template, {
            usage: 0,
            effectiveness: 0,
            userSatisfaction: 0
          });
        }
        
        const metrics = templateMetrics.get(template);
        metrics.usage++;
        metrics.effectiveness += interaction.templateEffectiveness || 0.5;
        metrics.userSatisfaction += interaction.userSatisfaction || 0.5;
      }
    });

    // Calculate averages
    const effectiveness: any = {};
    for (const [template, metrics] of templateMetrics) {
      effectiveness[template] = {
        usage: metrics.usage,
        avgEffectiveness: metrics.effectiveness / metrics.usage,
        avgSatisfaction: metrics.userSatisfaction / metrics.usage,
        confidence: Math.min(metrics.usage / 10, 1.0) // More usage = higher confidence
      };
    }

    return effectiveness;
  }

  private analyzeTemplatePreferences(interactions: any[]): any {
    const preferences = {
      mostUsed: null,
      highestSatisfaction: null,
      contextualPreferences: new Map(),
      consistency: 0
    };

    // Count template usage
    const templateCounts = new Map();
    const templateSatisfaction = new Map();

    interactions.forEach(interaction => {
      const template = interaction.selectedTemplate?.type;
      if (template) {
        templateCounts.set(template, (templateCounts.get(template) || 0) + 1);
        
        if (!templateSatisfaction.has(template)) {
          templateSatisfaction.set(template, []);
        }
        templateSatisfaction.get(template).push(interaction.userSatisfaction || 0.5);
      }
    });

    // Find most used and highest satisfaction
    let maxUsage = 0;
    let maxSatisfaction = 0;

    for (const [template, count] of templateCounts) {
      if (count > maxUsage) {
        maxUsage = count;
        preferences.mostUsed = template;
      }
    }

    for (const [template, satisfactionScores] of templateSatisfaction) {
      const avgSatisfaction = satisfactionScores.reduce((a: number, b: number) => a + b, 0) / satisfactionScores.length;
      if (avgSatisfaction > maxSatisfaction) {
        maxSatisfaction = avgSatisfaction;
        preferences.highestSatisfaction = template;
      }
    }

    return preferences;
  }

  private calculateHistoryConfidence(
    projectHistory: ProjectOptimizationHistory,
    userPatterns: UserOptimizationPatterns,
    successfulInteractions: any[]
  ): number {
    let confidence = 0.3; // Base confidence

    // Project history confidence - more aggressive scoring
    if (projectHistory.totalInteractions >= 5) confidence += 0.15;
    if (projectHistory.totalInteractions >= 10) confidence += 0.2;
    if (projectHistory.totalInteractions >= 20) confidence += 0.25;

    // User pattern confidence - enhanced scoring
    if (userPatterns.consistency > 0.5) confidence += 0.1;
    if (userPatterns.consistency > 0.7) confidence += 0.15;
    if (userPatterns.adaptationRate > 0.1) confidence += 0.1;

    // Successful interaction confidence - more generous
    if (successfulInteractions.length >= 1) confidence += 0.05;
    if (successfulInteractions.length >= 5) confidence += 0.1;
    if (successfulInteractions.length >= 10) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private getFallbackHistory(): ReferenceHistory {
    return {
      projectHistory: {
        projectId: 'unknown',
        totalInteractions: 0,
        optimizationPatterns: [],
        templateEffectiveness: {},
        evolutionTimeline: [],
        lastActive: Date.now()
      },
      userPatterns: {
        userId: 'unknown',
        templatePreferences: {},
        communicationStyle: 'direct',
        expertiseProgression: [],
        domainFocus: [],
        consistency: 0.3,
        adaptationRate: 0.1
      },
      successfulInteractions: [],
      learningTrajectory: {
        userId: 'unknown',
        improvementMetrics: {},
        skillDevelopment: [],
        adaptationSpeed: 0.1,
        trajectoryConfidence: 0.3,
        predictedNeeds: []
      },
      confidence: 0.3,
      lastUpdated: Date.now(),
      processingTime: 0
    };
  }

  // Helper methods (simplified implementations)
  private buildEvolutionTimeline(interactions: any[]): any[] { return []; }
  private inferCommunicationStyle(interactions: any[]): string { return 'direct'; }
  private trackExpertiseProgression(interactions: any[]): any[] { return []; }
  private identifyDomainFocus(interactions: any[]): any[] { return []; }
  private measurePatternConsistency(interactions: any[]): number { return 0.7; }
  private calculateAdaptationRate(interactions: any[]): number { return 0.2; }
  private identifySuccessFactors(interaction: any): any[] { return []; }
  private measureImprovement(interactions: any[]): any { return {}; }
  private trackSkillDevelopment(interactions: any[]): any[] { return []; }
  private calculateAdaptationSpeed(interactions: any[]): number { return 0.15; }
  private assessTrajectoryConfidence(metrics: any): number { return 0.7; }
  private predictFutureNeeds(development: any[], speed: number): any[] { return []; }
  private analyzeTemplateUsage(interactions: any[]): any { return { dominantTemplate: null, confidence: 0.5, frequency: 0 }; }
  private analyzeContextualPatterns(interactions: any[]): any[] { return []; }
}

// Supporting interfaces
interface PatternThresholds {
  minimumInteractions: number;
  patternConfidenceThreshold: number;
  learningRateThreshold: number;
  stabilityThreshold: number;
}

interface LearningAnalytics {
  preferenceStability: Map<string, number>;
  improvementMetrics: Map<string, number>;
  contextualRelevance: Map<string, number>;
}
