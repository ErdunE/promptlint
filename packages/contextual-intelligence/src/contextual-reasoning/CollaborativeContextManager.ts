import { 
  CollaborativeContext,
  SimpleTeamStandards,
  UserRole,
  SharedPreferences
} from '../shared/ContextualTypes.js';
import { IntentAnalysis } from '../shared/IntentTypes.js';

export class CollaborativeContextManager {
  private roleIndicators!: Map<UserRole, string[]>;
  private teamContextPatterns!: RegExp[];
  private collaborationMarkers!: string[];

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    // Role detection patterns
    this.roleIndicators = new Map([
      [UserRole.DEVELOPER, [
        'implement', 'code', 'debug', 'build', 'develop', 'program',
        'coding', 'programming', 'development', 'software'
      ]],
      [UserRole.ARCHITECT, [
        'design', 'architecture', 'system', 'scalable', 'pattern',
        'structure', 'framework', 'enterprise', 'solution'
      ]],
      [UserRole.PROJECT_MANAGER, [
        'project', 'timeline', 'deadline', 'team', 'coordinate',
        'manage', 'planning', 'roadmap', 'milestone'
      ]],
      [UserRole.DEVOPS, [
        'deploy', 'infrastructure', 'kubernetes', 'docker', 'aws',
        'cloud', 'pipeline', 'deployment', 'monitoring', 'production'
      ]],
      [UserRole.QA_ENGINEER, [
        'test', 'testing', 'quality', 'bug', 'verify', 'validate',
        'automation', 'coverage', 'regression'
      ]],
      [UserRole.STUDENT, [
        'learning', 'study', 'course', 'assignment', 'homework',
        'university', 'school', 'beginner', 'new to'
      ]]
    ]);

    // Team collaboration indicators
    this.teamContextPatterns = [
      /\b(?:we|our|us|team|group|together)\b/gi,
      /\b(?:collaborate|shared|common|standard)\b/gi,
      /\b(?:company|organization|department)\b/gi
    ];

    // Collaboration requirement markers
    this.collaborationMarkers = [
      'team', 'shared', 'collaborate', 'together', 'group',
      'company', 'organization', 'standard', 'consistent', 'aligned'
    ];
  }

  analyzeCollaborativeContext(
    intentAnalysis: IntentAnalysis,
    prompt: string,
    userProfile?: any,
    teamSettings?: any
  ): CollaborativeContext {
    const startTime = performance.now();

    try {
      const teamStandards = this.detectTeamStandards(prompt, teamSettings);
      const roleContext = this.identifyUserRole(prompt, intentAnalysis, userProfile);
      const sharedPreferences = this.extractSharedPreferences(prompt, teamSettings);
      const individualOverrides = this.identifyIndividualPreferences(prompt, userProfile);
      const collaborationLevel = this.assessCollaborationLevel(prompt);

      const confidence = this.calculateCollaborativeConfidence(
        teamStandards, roleContext, sharedPreferences, prompt
      );

      const processingTime = performance.now() - startTime;
      console.log(`[CollaborativeContextManager] Processing time: ${processingTime.toFixed(2)}ms`);

      return {
        teamStandards,
        roleContext,
        sharedPreferences,
        individualOverrides,
        collaborationLevel,
        confidence,
        processingTime
      };
    } catch (error) {
      console.error('[CollaborativeContextManager] Analysis failed:', error);
      return this.getFallbackCollaborativeContext();
    }
  }

  private detectTeamStandards(prompt: string, teamSettings?: any): SimpleTeamStandards {
    const lowerPrompt = prompt.toLowerCase();
    
    // Default standards that can be overridden by team settings
    const standards: SimpleTeamStandards = {
      communicationStyle: 'professional',
      documentationLevel: 'standard',
      codeStyle: 'consistent',
      reviewProcess: 'peer-review',
      qualityGates: ['testing', 'documentation']
    };

    // Detect if prompt indicates specific standards
    if (lowerPrompt.includes('enterprise') || lowerPrompt.includes('production')) {
      standards.documentationLevel = 'comprehensive';
      standards.qualityGates.push('security-review', 'performance-testing');
    }

    if (lowerPrompt.includes('quick') || lowerPrompt.includes('prototype')) {
      standards.documentationLevel = 'minimal';
      standards.qualityGates = ['basic-testing'];
    }

    // Apply team settings if provided
    if (teamSettings) {
      Object.assign(standards, teamSettings);
    }

    return standards;
  }

  private identifyUserRole(
    prompt: string, 
    intentAnalysis: IntentAnalysis,
    userProfile?: any
  ): UserRole {
    const lowerPrompt = prompt.toLowerCase();
    let detectedRole = UserRole.DEVELOPER; // Default
    let maxScore = 0;

    // Score each role based on keyword matches
    for (const [role, indicators] of this.roleIndicators) {
      const score = indicators.filter(indicator => 
        lowerPrompt.includes(indicator)
      ).length;
      
      if (score > maxScore) {
        maxScore = score;
        detectedRole = role;
      }
    }

    // Use intent analysis to refine role detection
    if (maxScore === 0) {
      const instructionCategory = intentAnalysis.instruction.category;
      switch (instructionCategory) {
        case 'analyze':
          return UserRole.ARCHITECT;
        case 'code':
        case 'create':
          return UserRole.DEVELOPER;
        case 'solve':
          return UserRole.QA_ENGINEER;
        case 'explain':
          return UserRole.STUDENT;
        default:
          return UserRole.DEVELOPER;
      }
    }

    // Override with user profile if available
    if (userProfile && userProfile.role) {
      return userProfile.role;
    }

    return detectedRole;
  }

  private extractSharedPreferences(prompt: string, teamSettings?: any): SharedPreferences {
    const preferences: SharedPreferences = {
      templateStyle: 'structured',
      detailLevel: 'balanced',
      technicalLevel: 'intermediate',
      responseFormat: 'comprehensive'
    };

    const lowerPrompt = prompt.toLowerCase();

    // Infer preferences from prompt content
    if (lowerPrompt.includes('simple') || lowerPrompt.includes('basic')) {
      preferences.detailLevel = 'minimal';
      preferences.technicalLevel = 'beginner';
    }

    if (lowerPrompt.includes('detailed') || lowerPrompt.includes('comprehensive')) {
      preferences.detailLevel = 'detailed';
      preferences.responseFormat = 'comprehensive';
    }

    if (lowerPrompt.includes('expert') || lowerPrompt.includes('advanced')) {
      preferences.technicalLevel = 'advanced';
    }

    // Apply team preferences if available
    if (teamSettings && teamSettings.preferences) {
      Object.assign(preferences, teamSettings.preferences);
    }

    return preferences;
  }

  private identifyIndividualPreferences(prompt: string, userProfile?: any): any {
    // Individual overrides that take precedence over team standards
    const overrides: any = {};

    const lowerPrompt = prompt.toLowerCase();

    // Personal preference indicators
    if (lowerPrompt.includes('i prefer') || lowerPrompt.includes('i like')) {
      overrides.personalPreference = true;
    }

    if (lowerPrompt.includes('my way') || lowerPrompt.includes('my style')) {
      overrides.styleOverride = true;
    }

    // Apply user profile overrides if available
    if (userProfile && userProfile.personalPreferences) {
      Object.assign(overrides, userProfile.personalPreferences);
    }

    return overrides;
  }

  private assessCollaborationLevel(prompt: string): 'individual' | 'team' | 'organization' | 'public' {
    const lowerPrompt = prompt.toLowerCase();

    // Check for team collaboration indicators
    for (const pattern of this.teamContextPatterns) {
      if (pattern.test(prompt)) {
        if (lowerPrompt.includes('company') || lowerPrompt.includes('organization')) {
          return 'organization';
        }
        return 'team';
      }
    }

    // Check for public/educational context
    if (lowerPrompt.includes('public') || lowerPrompt.includes('open source') || 
        lowerPrompt.includes('community') || lowerPrompt.includes('tutorial')) {
      return 'public';
    }

    return 'individual';
  }

  private calculateCollaborativeConfidence(
    teamStandards: SimpleTeamStandards,
    roleContext: UserRole,
    sharedPreferences: SharedPreferences,
    prompt: string
  ): number {
    let confidence = 0.5; // Base confidence

    const lowerPrompt = prompt.toLowerCase();

    // Boost confidence based on clear collaboration indicators
    const collaborationMatches = this.collaborationMarkers.filter(marker => 
      lowerPrompt.includes(marker)
    ).length;
    
    if (collaborationMatches > 0) confidence += 0.3;
    if (collaborationMatches >= 2) confidence += 0.1;

    // Role detection confidence
    const roleKeywords = this.roleIndicators.get(roleContext) || [];
    const roleMatches = roleKeywords.filter(keyword => lowerPrompt.includes(keyword)).length;
    
    if (roleMatches > 0) confidence += 0.2;

    return Math.min(confidence, 1.0);
  }

  private getFallbackCollaborativeContext(): CollaborativeContext {
    return {
      teamStandards: {
        communicationStyle: 'professional',
        documentationLevel: 'standard',
        codeStyle: 'consistent',
        reviewProcess: 'peer-review',
        qualityGates: ['testing']
      },
      roleContext: UserRole.DEVELOPER,
      sharedPreferences: {
        templateStyle: 'structured',
        detailLevel: 'balanced',
        technicalLevel: 'intermediate',
        responseFormat: 'comprehensive'
      },
      individualOverrides: {},
      collaborationLevel: 'individual',
      confidence: 0.3,
      processingTime: 0
    };
  }
}
