/**
 * PromptLint Adaptive Engine
 * Phase 3.2 - Adaptive Template Generation
 * 
 * Main entry point for adaptive template generation capabilities
 */

export { AdaptiveTemplateGenerator } from './AdaptiveTemplateGenerator.js';
export { PreferenceLearningEngine } from './PreferenceLearningEngine.js';
export { EffectivenessTracker } from './EffectivenessTracker.js';

// Import classes for factory function
import { AdaptiveTemplateGenerator } from './AdaptiveTemplateGenerator.js';
import { PreferenceLearningEngine } from './PreferenceLearningEngine.js';
import { EffectivenessTracker } from './EffectivenessTracker.js';

// Export all types
export type {
  // Core adaptive types
  AdaptiveTemplate,
  Personalization,
  PersonalizationType,
  AdaptationMetadata,
  
  // User context and preferences
  UserContext,
  TemplatePreferences,
  PreferenceComplexity,
  StructuralPreference,
  PresentationStyle,
  DetailLevel,
  OrganizationPattern,
  
  // Effectiveness tracking
  TemplateEffectiveness,
  EffectivenessMetrics,
  UserSatisfactionIndicator,
  TemplateUsageHistory,
  
  // Learning and adaptation
  OptimizationHistory,
  UserStats,
  AdaptiveSettings,
  UserPreferencePattern,
  
  // Recommendation and analysis
  TemplateRecommendation,
  UserInteraction,
  SemanticAnalysis,
  PromptContext,
  UserFeedback
} from './types.js';

// Convenience factory function
export function createAdaptiveEngine() {
  const templateGenerator = new AdaptiveTemplateGenerator();
  const preferenceLearning = new PreferenceLearningEngine();
  const effectivenessTracker = new EffectivenessTracker();
  
  return {
    templateGenerator,
    preferenceLearning,
    effectivenessTracker
  };
}
