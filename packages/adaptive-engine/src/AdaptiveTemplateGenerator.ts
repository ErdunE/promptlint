/**
 * PromptLint Adaptive Template Generator
 * Phase 3.2 - Core template adaptation engine
 */

import { TemplateCandidate, TemplateType } from '../../shared-types/dist/index.js';
import { 
  AdaptiveTemplate, 
  UserContext, 
  SemanticAnalysis, 
  Personalization,
  PersonalizationType,
  AdaptationMetadata,
  TemplatePreferences,
  PresentationStyle,
  DetailLevel,
  OrganizationPattern
} from './types.js';

export class AdaptiveTemplateGenerator {
  private readonly maxAdaptationTime = 60; // 60ms budget for adaptation
  private readonly faithfulnessThreshold = 0.95; // minimum faithfulness score

  /**
   * Generate personalized templates based on user preferences and context
   */
  async generatePersonalizedTemplate(
    prompt: string,
    semanticAnalysis: SemanticAnalysis,
    userContext: UserContext,
    baseCandidates: TemplateCandidate[]
  ): Promise<AdaptiveTemplate[]> {
    const startTime = performance.now();

    try {
      // Apply basic preferences even with limited data
      if (!this.hasMinimumUserData(userContext)) {
        return this.applyBasicPreferences(baseCandidates, userContext.preferences);
      }

      // Skip adaptation if disabled by user
      if (!userContext.settings.enableTemplateAdaptation) {
        return this.convertToAdaptiveTemplates(baseCandidates, 'adaptation_disabled');
      }

      const adaptedTemplates: AdaptiveTemplate[] = [];

      for (const baseCandidate of baseCandidates) {
        const adaptedTemplate = await this.adaptTemplateToPreferences(
          baseCandidate,
          userContext.preferences,
          semanticAnalysis
        );

        // FORCE user alignment calculation from actual preferences
        adaptedTemplate.userAlignment = this.calculateActualUserAlignment(
          baseCandidate.type,
          userContext.preferences
        );

        adaptedTemplates.push(adaptedTemplate);

        // Check time budget
        if (performance.now() - startTime > this.maxAdaptationTime) {
          console.warn('[AdaptiveEngine] Adaptation time budget exceeded, using remaining base templates');
          // Add remaining base templates without adaptation
          const remaining = baseCandidates.slice(adaptedTemplates.length);
          adaptedTemplates.push(...this.convertToAdaptiveTemplates(remaining, 'time_budget_exceeded'));
          break;
        }
      }

      // Rank by user preference alignment
      const rankedTemplates = this.rankByUserPreference(adaptedTemplates, userContext.preferences);

      console.log(`[AdaptiveEngine] Generated ${rankedTemplates.length} adaptive templates in ${(performance.now() - startTime).toFixed(2)}ms`);
      
      return rankedTemplates;

    } catch (error) {
      console.error('[AdaptiveEngine] Adaptation failed:', error);
      return this.convertToAdaptiveTemplates(baseCandidates, 'adaptation_error');
    }
  }

  /**
   * Adapt a single template to user preferences while preserving faithfulness
   */
  async adaptTemplateToPreferences(
    baseTemplate: TemplateCandidate,
    preferences: TemplatePreferences,
    semanticAnalysis: SemanticAnalysis
  ): Promise<AdaptiveTemplate> {
    const startTime = performance.now();
    const personalizations: Personalization[] = [];

    try {
      let adaptedContent = baseTemplate.content;
      let adaptedType = baseTemplate.type;

      // 1. Apply structural preferences
      const structuralResult = this.applyStructuralPreferences(
        adaptedContent,
        preferences.structuralPreferences,
        semanticAnalysis
      );
      if (structuralResult.applied) {
        adaptedContent = structuralResult.content;
        personalizations.push({
          type: PersonalizationType.STRUCTURAL_PREFERENCE,
          strength: structuralResult.strength,
          description: structuralResult.description,
          appliedAt: Date.now()
        });
      }

      // 2. Adapt presentation style
      const styleResult = this.adaptPresentationStyle(
        adaptedContent,
        preferences.presentationStyle,
        semanticAnalysis
      );
      if (styleResult.applied) {
        adaptedContent = styleResult.content;
        personalizations.push({
          type: PersonalizationType.PRESENTATION_STYLE,
          strength: styleResult.strength,
          description: styleResult.description,
          appliedAt: Date.now()
        });
      }

      // 3. Adjust detail level
      const detailResult = this.adjustDetailLevel(
        adaptedContent,
        preferences.detailLevel,
        semanticAnalysis
      );
      if (detailResult.applied) {
        adaptedContent = detailResult.content;
        personalizations.push({
          type: PersonalizationType.DETAIL_LEVEL,
          strength: detailResult.strength,
          description: detailResult.description,
          appliedAt: Date.now()
        });
      }

      // 4. Apply organization pattern
      const organizationResult = this.applyOrganizationPattern(
        adaptedContent,
        preferences.organizationPattern,
        semanticAnalysis
      );
      if (organizationResult.applied) {
        adaptedContent = organizationResult.content;
        personalizations.push({
          type: PersonalizationType.ORGANIZATION_PATTERN,
          strength: organizationResult.strength,
          description: organizationResult.description,
          appliedAt: Date.now()
        });
      }

      // 5. Validate faithfulness
      const faithfulnessScore = this.validateFaithfulness(baseTemplate.content, adaptedContent);
      
      if (faithfulnessScore < this.faithfulnessThreshold) {
        console.warn(`[AdaptiveEngine] Faithfulness validation failed (${faithfulnessScore.toFixed(3)}), using base template`);
        return this.convertToAdaptiveTemplate(baseTemplate, 'faithfulness_violation');
      }

      // Calculate effectiveness and alignment scores
      const effectivenessScore = this.calculateEffectivenessScore(baseTemplate, personalizations);
      const userAlignment = this.calculateUserAlignment(baseTemplate.type, preferences);

      const adaptationMetadata: AdaptationMetadata = {
        originalScore: baseTemplate.score,
        adaptationTime: performance.now() - startTime,
        confidenceLevel: Math.min(faithfulnessScore, userAlignment),
        faithfulnessValidated: true
      };

      return {
        ...baseTemplate,
        content: adaptedContent,
        type: adaptedType,
        score: Math.min(100, baseTemplate.score + (userAlignment * 10)), // Boost score based on alignment
        baseTemplate: baseTemplate.type,
        personalizations,
        effectivenessScore,
        userAlignment,
        adaptationMetadata
      };

    } catch (error) {
      console.error('[AdaptiveEngine] Template adaptation failed:', error);
      return this.convertToAdaptiveTemplate(baseTemplate, 'adaptation_error');
    }
  }

  /**
   * Apply structural preferences (bullets, numbered lists, etc.)
   */
  private applyStructuralPreferences(
    content: string,
    structuralPreferences: any[],
    semanticAnalysis: SemanticAnalysis
  ): { applied: boolean; content: string; strength: number; description: string } {
    // Find the most preferred structure for this context
    const bestPreference = structuralPreferences
      .filter(pref => this.isContextApplicable(pref.contexts, semanticAnalysis.domain))
      .sort((a, b) => b.preference - a.preference)[0];

    if (!bestPreference || bestPreference.preference < 0.6) {
      return { applied: false, content, strength: 0, description: 'No strong structural preference' };
    }

    let adaptedContent = content;
    let applied = false;
    let description = '';

    // Apply structural transformation based on preference
    switch (bestPreference.type) {
      case 'bullets':
        if (!content.includes('•') && !content.includes('-')) {
          adaptedContent = this.convertToBulletPoints(content);
          applied = true;
          description = 'Converted to bullet point format based on user preference';
        }
        break;
      
      case 'numbered':
        if (!content.match(/^\d+\./m)) {
          adaptedContent = this.convertToNumberedList(content);
          applied = true;
          description = 'Converted to numbered list format based on user preference';
        }
        break;
      
      case 'sections':
        if (!content.includes('**') && content.length > 200) {
          adaptedContent = this.convertToSections(content);
          applied = true;
          description = 'Organized into sections based on user preference';
        }
        break;
    }

    return {
      applied,
      content: adaptedContent,
      strength: bestPreference.preference,
      description
    };
  }

  /**
   * Adapt presentation style (professional, conversational, etc.)
   */
  private adaptPresentationStyle(
    content: string,
    presentationStyle: PresentationStyle,
    semanticAnalysis: SemanticAnalysis
  ): { applied: boolean; content: string; strength: number; description: string } {
    // Determine if style adaptation is needed
    const currentStyle = this.detectCurrentStyle(content);
    
    if (currentStyle === presentationStyle) {
      return { applied: false, content, strength: 0, description: 'Style already matches preference' };
    }

    let adaptedContent = content;
    let applied = false;
    let description = '';
    const strength = 0.7; // Medium strength adaptation

    switch (presentationStyle) {
      case PresentationStyle.CONVERSATIONAL:
        if (currentStyle === PresentationStyle.PROFESSIONAL) {
          adaptedContent = this.makeMoreConversational(content);
          applied = true;
          description = 'Adapted to conversational style';
        }
        break;
      
      case PresentationStyle.PROFESSIONAL:
        if (currentStyle === PresentationStyle.CONVERSATIONAL) {
          adaptedContent = this.makeMoreProfessional(content);
          applied = true;
          description = 'Adapted to professional style';
        }
        break;
      
      case PresentationStyle.TECHNICAL:
        adaptedContent = this.makeMoreTechnical(content, semanticAnalysis);
        applied = true;
        description = 'Adapted to technical style';
        break;
    }

    return { applied, content: adaptedContent, strength, description };
  }

  /**
   * Adjust detail level based on user preference
   */
  private adjustDetailLevel(
    content: string,
    detailLevel: DetailLevel,
    semanticAnalysis: SemanticAnalysis
  ): { applied: boolean; content: string; strength: number; description: string } {
    const currentDetailLevel = this.assessDetailLevel(content);
    
    if (currentDetailLevel === detailLevel) {
      return { applied: false, content, strength: 0, description: 'Detail level already matches preference' };
    }

    let adaptedContent = content;
    let applied = false;
    let description = '';
    const strength = 0.6;

    switch (detailLevel) {
      case DetailLevel.CONCISE:
        if (currentDetailLevel !== DetailLevel.CONCISE) {
          adaptedContent = this.makeConcise(content);
          applied = true;
          description = 'Reduced detail level for conciseness';
        }
        break;
      
      case DetailLevel.COMPREHENSIVE:
        if (currentDetailLevel !== DetailLevel.COMPREHENSIVE) {
          adaptedContent = this.makeComprehensive(content, semanticAnalysis);
          applied = true;
          description = 'Enhanced detail level for comprehensiveness';
        }
        break;
      
      case DetailLevel.ADAPTIVE:
        const optimalLevel = semanticAnalysis.complexity > 0.7 ? DetailLevel.COMPREHENSIVE : DetailLevel.CONCISE;
        if (currentDetailLevel !== optimalLevel) {
          adaptedContent = optimalLevel === DetailLevel.COMPREHENSIVE 
            ? this.makeComprehensive(content, semanticAnalysis)
            : this.makeConcise(content);
          applied = true;
          description = `Adapted detail level based on prompt complexity (${optimalLevel})`;
        }
        break;
    }

    return { applied, content: adaptedContent, strength, description };
  }

  /**
   * Apply organization pattern
   */
  private applyOrganizationPattern(
    content: string,
    organizationPattern: OrganizationPattern,
    semanticAnalysis: SemanticAnalysis
  ): { applied: boolean; content: string; strength: number; description: string } {
    const currentPattern = this.detectOrganizationPattern(content);
    
    if (currentPattern === organizationPattern) {
      return { applied: false, content, strength: 0, description: 'Organization already matches preference' };
    }

    let adaptedContent = content;
    let applied = false;
    let description = '';
    const strength = 0.5;

    // Apply organization transformation
    switch (organizationPattern) {
      case OrganizationPattern.HIERARCHICAL:
        adaptedContent = this.applyHierarchicalOrganization(content);
        applied = true;
        description = 'Reorganized with hierarchical structure';
        break;
      
      case OrganizationPattern.SEQUENTIAL:
        adaptedContent = this.applySequentialOrganization(content);
        applied = true;
        description = 'Reorganized in sequential order';
        break;
      
      case OrganizationPattern.PRIORITY_BASED:
        adaptedContent = this.applyPriorityOrganization(content, semanticAnalysis);
        applied = true;
        description = 'Reorganized by priority';
        break;
    }

    return { applied, content: adaptedContent, strength, description };
  }

  // Helper methods for content transformation
  private convertToBulletPoints(content: string): string {
    // Convert sentences to bullet points
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 1) return content;
    
    return sentences.map(sentence => `• ${sentence.trim()}`).join('\n');
  }

  private convertToNumberedList(content: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 1) return content;
    
    return sentences.map((sentence, index) => `${index + 1}. ${sentence.trim()}`).join('\n');
  }

  private convertToSections(content: string): string {
    // Simple section conversion - this could be more sophisticated
    const parts = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    if (parts.length <= 2) return content;
    
    return parts.map((part, index) => {
      const sectionTitle = this.generateSectionTitle(part, index);
      return `**${sectionTitle}**\n${part.trim()}`;
    }).join('\n\n');
  }

  private generateSectionTitle(content: string, index: number): string {
    // Extract key concepts for section title
    const words = content.trim().split(' ').slice(0, 3);
    return words.join(' ').replace(/[^\w\s]/g, '') || `Section ${index + 1}`;
  }

  private makeMoreConversational(content: string): string {
    return content
      .replace(/\bshall\b/g, 'should')
      .replace(/\bwill\b/g, 'can')
      .replace(/\butilize\b/g, 'use')
      .replace(/\bfacilitate\b/g, 'help')
      .replace(/\bimplement\b/g, 'set up');
  }

  private makeMoreProfessional(content: string): string {
    return content
      .replace(/\bcan\b/g, 'will')
      .replace(/\buse\b/g, 'utilize')
      .replace(/\bhelp\b/g, 'facilitate')
      .replace(/\bset up\b/g, 'implement')
      .replace(/\bget\b/g, 'obtain');
  }

  private makeMoreTechnical(content: string, semanticAnalysis: SemanticAnalysis): string {
    // Add technical precision based on domain
    if (semanticAnalysis.domain === 'coding') {
      return content.replace(/code/g, 'implementation');
    }
    return content;
  }

  private makeConcise(content: string): string {
    // Remove redundant phrases and simplify
    return content
      .replace(/in order to/g, 'to')
      .replace(/due to the fact that/g, 'because')
      .replace(/at this point in time/g, 'now')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private makeComprehensive(content: string, semanticAnalysis: SemanticAnalysis): string {
    // Add context and detail (simplified implementation)
    if (content.length < 100) {
      return content + '\n\nAdditional considerations and context may be relevant based on your specific requirements.';
    }
    return content;
  }

  // Assessment and detection methods
  private detectCurrentStyle(content: string): PresentationStyle {
    const formalWords = ['shall', 'utilize', 'facilitate', 'implement'].filter(word => content.includes(word)).length;
    const casualWords = ['can', 'use', 'help', 'get', 'set up'].filter(word => content.includes(word)).length;
    
    if (formalWords > casualWords) return PresentationStyle.PROFESSIONAL;
    if (casualWords > formalWords) return PresentationStyle.CONVERSATIONAL;
    return PresentationStyle.PROFESSIONAL; // default
  }

  private assessDetailLevel(content: string): DetailLevel {
    if (content.length < 100) return DetailLevel.CONCISE;
    if (content.length > 300) return DetailLevel.COMPREHENSIVE;
    return DetailLevel.BALANCED;
  }

  private detectOrganizationPattern(content: string): OrganizationPattern {
    if (content.includes('**') || content.includes('#')) return OrganizationPattern.HIERARCHICAL;
    if (content.match(/^\d+\./m)) return OrganizationPattern.SEQUENTIAL;
    return OrganizationPattern.CATEGORICAL;
  }

  private applyHierarchicalOrganization(content: string): string {
    // Simple hierarchical organization
    const parts = content.split('\n').filter(part => part.trim());
    if (parts.length <= 1) return content;
    
    return parts.map((part, index) => {
      if (index === 0) return `**Main Objective**\n${part}`;
      return `**Step ${index}**\n${part}`;
    }).join('\n\n');
  }

  private applySequentialOrganization(content: string): string {
    const parts = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return parts.map((part, index) => `${index + 1}. ${part.trim()}`).join('\n');
  }

  private applyPriorityOrganization(content: string, semanticAnalysis: SemanticAnalysis): string {
    // Prioritize based on semantic importance
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Simple priority scoring based on keywords
    const prioritized = sentences.map(sentence => ({
      content: sentence.trim(),
      priority: this.calculateSentencePriority(sentence, semanticAnalysis)
    }))
    .sort((a, b) => b.priority - a.priority)
    .map((item, index) => `${index + 1}. ${item.content}`);
    
    return prioritized.join('\n');
  }

  private calculateSentencePriority(sentence: string, semanticAnalysis: SemanticAnalysis): number {
    let priority = 0;
    
    // Boost priority for sentences containing key entities
    semanticAnalysis.entities.forEach(entity => {
      if (sentence.toLowerCase().includes(entity.toLowerCase())) {
        priority += 1;
      }
    });
    
    // Boost for action words
    const actionWords = ['create', 'implement', 'analyze', 'develop', 'design'];
    actionWords.forEach(word => {
      if (sentence.toLowerCase().includes(word)) {
        priority += 0.5;
      }
    });
    
    return priority;
  }

  // Utility methods
  private hasMinimumUserData(userContext: UserContext): boolean {
    return userContext.history.length >= userContext.settings.minimumHistoryForAdaptation;
  }

  /**
   * Apply basic preferences without full adaptation - handles insufficient user data
   */
  private applyBasicPreferences(
    baseCandidates: TemplateCandidate[],
    preferences: TemplatePreferences
  ): AdaptiveTemplate[] {
    console.log('[AdaptiveEngine] Applying basic preferences with limited user data');
    
    const adaptiveTemplates = baseCandidates.map(candidate => {
      const adaptiveTemplate = this.convertToAdaptiveTemplate(candidate, 'basic_preferences_applied');
      
      // Apply template affinity scores to user alignment
      adaptiveTemplate.userAlignment = this.calculateActualUserAlignment(candidate.type, preferences);
      
      // Add basic personalization if affinity is strong
      const affinity = preferences.templateAffinities?.[candidate.type] || 0.5;
      if (affinity > 0.8) {
        adaptiveTemplate.personalizations = [{
          type: PersonalizationType.STRUCTURAL_PREFERENCE,
          strength: affinity,
          description: `High user affinity (${(affinity * 100).toFixed(0)}%) for ${candidate.type} templates`,
          appliedAt: Date.now()
        }];
      }
      
      return adaptiveTemplate;
    });
    
    // Sort by user preference alignment (93% bullet affinity should prioritize bullet templates)
    return adaptiveTemplates.sort((a, b) => b.userAlignment - a.userAlignment);
  }

  /**
   * Calculate actual user alignment from preferences - not default 0.5
   */
  private calculateActualUserAlignment(
    templateType: TemplateType,
    preferences: TemplatePreferences
  ): number {
    // Get template affinity (93% bullet affinity should return ~0.93)
    const affinity = preferences.templateAffinities?.[templateType];
    if (affinity !== undefined) {
      return affinity;
    }
    
    // Fallback to default if no preference data
    return 0.5;
  }

  private isContextApplicable(contexts: string[], domain: string): boolean {
    return contexts.length === 0 || contexts.includes(domain) || contexts.includes('all');
  }

  private validateFaithfulness(originalContent: string, adaptedContent: string): number {
    // Simple faithfulness validation - could be enhanced with more sophisticated NLP
    const originalWords = new Set(originalContent.toLowerCase().split(/\W+/).filter(w => w.length > 2));
    const adaptedWords = new Set(adaptedContent.toLowerCase().split(/\W+/).filter(w => w.length > 2));
    
    const intersection = new Set(Array.from(originalWords).filter(word => adaptedWords.has(word)));
    const union = new Set([...Array.from(originalWords), ...Array.from(adaptedWords)]);
    
    return intersection.size / union.size; // Jaccard similarity
  }

  private calculateEffectivenessScore(baseTemplate: TemplateCandidate, personalizations: Personalization[]): number {
    let score = baseTemplate.score;
    
    // Boost score based on personalization strength
    const totalPersonalizationStrength = personalizations.reduce((sum, p) => sum + p.strength, 0);
    score += totalPersonalizationStrength * 5; // Up to 5 point boost per personalization
    
    return Math.min(100, score);
  }

  private calculateUserAlignment(templateType: TemplateType, preferences: TemplatePreferences): number {
    return preferences.templateAffinities[templateType] || 0.5;
  }

  private rankByUserPreference(templates: AdaptiveTemplate[], preferences: TemplatePreferences): AdaptiveTemplate[] {
    return templates.sort((a, b) => {
      // Primary sort by user alignment
      const alignmentDiff = b.userAlignment - a.userAlignment;
      if (Math.abs(alignmentDiff) > 0.1) return alignmentDiff;
      
      // Secondary sort by effectiveness score
      return b.effectivenessScore - a.effectivenessScore;
    });
  }

  private convertToAdaptiveTemplates(templates: TemplateCandidate[], fallbackReason: string): AdaptiveTemplate[] {
    return templates.map(template => this.convertToAdaptiveTemplate(template, fallbackReason));
  }

  private convertToAdaptiveTemplate(template: TemplateCandidate, fallbackReason: string): AdaptiveTemplate {
    return {
      ...template,
      baseTemplate: template.type,
      personalizations: [],
      effectivenessScore: template.score,
      userAlignment: 0.5, // neutral alignment when no adaptation
      adaptationMetadata: {
        originalScore: template.score,
        adaptationTime: 0,
        confidenceLevel: 0.5,
        fallbackReason,
        faithfulnessValidated: true
      }
    };
  }
}
