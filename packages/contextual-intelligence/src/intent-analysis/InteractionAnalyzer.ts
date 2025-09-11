import { 
  InteractionAnalysis,
  CommunicationStyle,
  DetailLevel,
  UrgencyLevel,
  CollaborationContext 
} from '../shared/IntentTypes.js';

export class InteractionAnalyzer {
  private communicationPatterns!: Map<CommunicationStyle, RegExp[]>;
  private detailLevelIndicators!: Map<DetailLevel, string[]>;
  private urgencyMarkers!: Map<UrgencyLevel, RegExp[]>;
  private collaborationIndicators!: Map<CollaborationContext, string[]>;

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    // Communication style detection patterns
    this.communicationPatterns = new Map([
      ['direct', [
        /\b(?:implement|create|build|make|do|execute|run)\b/gi,
        /^(?:create|build|implement|make|write|develop)/i,
        /\b(?:just|simply|directly|immediately)\b/gi
      ]],
      ['conversational', [
        /\b(?:help me|can you|would you|could you|please)\b/gi,
        /\b(?:i need|i want|i'm trying|i'd like)\b/gi,
        /\b(?:thanks|thank you|appreciate)\b/gi
      ]],
      ['formal', [
        /\b(?:require|request|specification|documentation)\b/gi,
        /\b(?:pursuant to|in accordance with|as per)\b/gi,
        /\b(?:kindly|respectfully|formally)\b/gi
      ]],
      ['technical', [
        /\b(?:algorithm|architecture|implementation|optimization)\b/gi,
        /\b(?:performance|scalability|efficiency|throughput)\b/gi,
        /\b(?:framework|library|api|sdk|protocol)\b/gi
      ]]
    ]);

    // Detail level preference indicators
    this.detailLevelIndicators = new Map([
      ['minimal', ['quick', 'brief', 'short', 'summary', 'overview', 'just the basics']],
      ['balanced', ['explain', 'show me', 'help understand', 'guide me', 'walk through']],
      ['detailed', ['comprehensive', 'thorough', 'complete', 'in-depth', 'step-by-step']],
      ['comprehensive', ['exhaustive', 'full documentation', 'everything', 'all aspects', 'detailed guide']]
    ]);

    // Urgency level markers
    this.urgencyMarkers = new Map([
      ['low', [
        /\b(?:whenever|eventually|when you can|no rush|take your time)\b/gi,
        /\b(?:future|someday|later|planning ahead)\b/gi
      ]],
      ['normal', [
        /\b(?:help|need|want|looking for|trying to)\b/gi,
        /\b(?:soon|today|this week|when possible)\b/gi
      ]],
      ['high', [
        /\b(?:important|priority|needed|critical|essential)\b/gi,
        /\b(?:deadline|due|by tomorrow|this afternoon)\b/gi
      ]],
      ['urgent', [
        /\b(?:urgent|asap|immediately|right now|emergency)\b/gi,
        /\b(?:urgent|critical|blocker|production down)\b/gi
      ]]
    ]);

    // Collaboration context indicators
    this.collaborationIndicators = new Map([
      ['individual', ['i need', 'my project', 'help me', 'personal', 'learning']],
      ['team', ['we need', 'our project', 'team', 'collaboration', 'shared', 'group']],
      ['public', ['open source', 'community', 'public', 'documentation', 'tutorial']],
      ['educational', ['learning', 'student', 'course', 'assignment', 'homework', 'study']]
    ]);
  }

  analyzeInteraction(prompt: string, context?: any): InteractionAnalysis {
    const startTime = performance.now();
    
    try {
      const communicationStyle = this.detectCommunicationStyle(prompt);
      const preferredDetailLevel = this.determineDetailLevel(prompt);
      const urgencyIndicators = this.assessUrgency(prompt);
      const collaborationContext = this.identifyCollaborationContext(prompt);

      const confidence = this.calculateInteractionConfidence(
        communicationStyle,
        preferredDetailLevel,
        urgencyIndicators,
        collaborationContext,
        prompt
      );

      const processingTime = performance.now() - startTime;
      console.log(`[InteractionAnalyzer] Processing time: ${processingTime.toFixed(2)}ms`);

      return {
        communicationStyle,
        preferredDetailLevel,
        urgencyIndicators,
        collaborationContext,
        confidence,
        processingTime
      };
    } catch (error) {
      console.error('[InteractionAnalyzer] Analysis failed:', error);
      return this.getFallbackAnalysis();
    }
  }

  private detectCommunicationStyle(prompt: string): CommunicationStyle {
    const styleScores = new Map<CommunicationStyle, number>();
    
    // Initialize scores
    for (const style of this.communicationPatterns.keys()) {
      styleScores.set(style, 0);
    }

    // Score each communication style based on pattern matches
    for (const [style, patterns] of this.communicationPatterns) {
      let score = 0;
      for (const pattern of patterns) {
        const matches = prompt.match(pattern);
        if (matches) {
          score += matches.length;
        }
      }
      styleScores.set(style, score);
    }

    // Return style with highest score
    let maxScore = 0;
    let detectedStyle: CommunicationStyle = 'direct';
    
    for (const [style, score] of styleScores) {
      if (score > maxScore) {
        maxScore = score;
        detectedStyle = style;
      }
    }

    return detectedStyle;
  }

  private determineDetailLevel(prompt: string): DetailLevel {
    const lowerPrompt = prompt.toLowerCase();
    let detectedLevel: DetailLevel = 'balanced'; // Default
    let maxScore = 0;

    for (const [level, indicators] of this.detailLevelIndicators) {
      const score = indicators.filter(indicator => 
        lowerPrompt.includes(indicator)
      ).length;
      
      if (score > maxScore) {
        maxScore = score;
        detectedLevel = level;
      }
    }

    // Additional heuristics based on prompt length and complexity
    if (prompt.length < 50 && maxScore === 0) {
      return 'minimal';
    } else if (prompt.length > 200 && maxScore === 0) {
      return 'detailed';
    }

    return detectedLevel;
  }

  private assessUrgency(prompt: string): UrgencyLevel {
    let detectedUrgency: UrgencyLevel = 'normal'; // Default
    let maxScore = 0;

    for (const [urgency, patterns] of this.urgencyMarkers) {
      let score = 0;
      for (const pattern of patterns) {
        const matches = prompt.match(pattern);
        if (matches) {
          score += matches.length;
        }
      }
      
      if (score > maxScore) {
        maxScore = score;
        detectedUrgency = urgency;
      }
    }

    return detectedUrgency;
  }

  private identifyCollaborationContext(prompt: string): CollaborationContext {
    const lowerPrompt = prompt.toLowerCase();
    let detectedContext: CollaborationContext = 'individual'; // Default
    let maxScore = 0;

    for (const [context, indicators] of this.collaborationIndicators) {
      const score = indicators.filter(indicator => 
        lowerPrompt.includes(indicator)
      ).length;
      
      if (score > maxScore) {
        maxScore = score;
        detectedContext = context;
      }
    }

    return detectedContext;
  }

  private calculateInteractionConfidence(
    communicationStyle: CommunicationStyle,
    detailLevel: DetailLevel,
    urgency: UrgencyLevel,
    collaboration: CollaborationContext,
    prompt: string
  ): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence based on clear indicators
    const lowerPrompt = prompt.toLowerCase();
    
    // Communication style confidence
    const stylePatterns = this.communicationPatterns.get(communicationStyle) || [];
    const styleMatches = stylePatterns.reduce((sum, pattern) => {
      const matches = prompt.match(pattern);
      return sum + (matches ? matches.length : 0);
    }, 0);
    
    if (styleMatches > 0) confidence += 0.2;

    // Detail level confidence
    const detailIndicators = this.detailLevelIndicators.get(detailLevel) || [];
    const detailMatches = detailIndicators.filter(indicator => 
      lowerPrompt.includes(indicator)
    ).length;
    
    if (detailMatches > 0) confidence += 0.15;

    // Urgency confidence
    const urgencyPatterns = this.urgencyMarkers.get(urgency) || [];
    const urgencyMatches = urgencyPatterns.reduce((sum, pattern) => {
      const matches = prompt.match(pattern);
      return sum + (matches ? matches.length : 0);
    }, 0);
    
    if (urgencyMatches > 0) confidence += 0.1;

    // Collaboration confidence
    const collaborationIndicators = this.collaborationIndicators.get(collaboration) || [];
    const collaborationMatches = collaborationIndicators.filter(indicator => 
      lowerPrompt.includes(indicator)
    ).length;
    
    if (collaborationMatches > 0) confidence += 0.15;

    return Math.min(confidence, 1.0);
  }

  private getFallbackAnalysis(): InteractionAnalysis {
    return {
      communicationStyle: 'direct',
      preferredDetailLevel: 'balanced',
      urgencyIndicators: 'normal',
      collaborationContext: 'individual',
      confidence: 0.3,
      processingTime: 0
    };
  }
}
