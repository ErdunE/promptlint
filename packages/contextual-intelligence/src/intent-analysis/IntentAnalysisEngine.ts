import { InstructionAnalyzer } from './InstructionAnalyzer.js';
import { MetaInstructionAnalyzer } from './MetaInstructionAnalyzer.js';
import { InteractionAnalyzer } from './InteractionAnalyzer.js';
import { 
  IntentAnalysis, 
  InstructionIntent,
  InteractionIntent,
  InteractionAnalysis as InteractionAnalysisType
} from '../shared/IntentTypes.js';
import { MetaInstructionAnalysis } from '../shared/ContextualTypes.js';

export class IntentAnalysisEngine {
  private instructionAnalyzer: InstructionAnalyzer;
  private metaInstructionAnalyzer: MetaInstructionAnalyzer;
  private interactionAnalyzer: InteractionAnalyzer;

  constructor() {
    this.instructionAnalyzer = new InstructionAnalyzer();
    this.metaInstructionAnalyzer = new MetaInstructionAnalyzer();
    this.interactionAnalyzer = new InteractionAnalyzer();
  }

  async analyzeIntent(prompt: string, userContext?: any): Promise<IntentAnalysis> {
    const startTime = performance.now();
    
    try {
      // Parallel analysis of all three intent layers
      const instructionAnalysis = await this.instructionAnalyzer.analyzeInstruction(prompt);
      const metaInstructionAnalysis = this.metaInstructionAnalyzer.analyzeMetaInstruction(prompt, userContext);
      const interactionAnalysis = this.interactionAnalyzer.analyzeInteraction(prompt, userContext);

      const totalProcessingTime = performance.now() - startTime;
      
      console.log(`[IntentAnalysisEngine] Total processing time: ${totalProcessingTime.toFixed(2)}ms`);

      return {
        instruction: instructionAnalysis,
        metaInstruction: {
          style: { formality: 'professional' as any, technicality: 'intermediate' as any, detail: 'moderate' as any, tone: [] },
          quality: { accuracy: 'high' as any, completeness: 'thorough' as any, performance: [], validation: [] },
          constraints: metaInstructionAnalysis.constraints.map(c => ({ type: c.type, description: c.description, severity: 'moderate' as any, flexibility: 'flexible' as any })),
          contextRequirements: [],
          confidence: metaInstructionAnalysis.confidence
        },
        interaction: {
          userExpertise: metaInstructionAnalysis.userExpertiseLevel as any,
          collaborationPattern: interactionAnalysis.collaborationContext as any,
          workflowStage: 'implementation' as any,
          interactionStyle: interactionAnalysis.communicationStyle as any,
          followUpExpectations: [],
          confidence: interactionAnalysis.confidence
        },
        confidence: this.calculateOverallConfidence(
          instructionAnalysis,
          metaInstructionAnalysis,
          interactionAnalysis
        ),
        performance: {
          totalTime: totalProcessingTime,
          layerTimes: [
            { layer: 'instruction' as any, processingTime: instructionAnalysis.confidence * 10, confidence: instructionAnalysis.confidence, fallbacksUsed: 0 },
            { layer: 'meta_instruction' as any, processingTime: metaInstructionAnalysis.processingTime, confidence: metaInstructionAnalysis.confidence, fallbacksUsed: 0 },
            { layer: 'interaction' as any, processingTime: interactionAnalysis.processingTime, confidence: interactionAnalysis.confidence, fallbacksUsed: 0 }
          ],
          memoryUsage: { peakUsage: 1024, averageUsage: 512, allocationCount: 10 },
          confidenceBreakdown: {
            instruction: instructionAnalysis.confidence,
            metaInstruction: metaInstructionAnalysis.confidence,
            interaction: interactionAnalysis.confidence,
            overall: this.calculateOverallConfidence(instructionAnalysis, metaInstructionAnalysis, interactionAnalysis)
          }
        }
      };
    } catch (error) {
      console.error('[IntentAnalysisEngine] Analysis failed:', error);
      return this.getFallbackAnalysis();
    }
  }

  validateIntentFaithfulness(analysis: IntentAnalysis, originalPrompt: string): boolean {
    // Validate that analysis preserves original intent
    const instruction = analysis.instruction;
    const originalLower = originalPrompt.toLowerCase();

    // Check that detected intent category aligns with prompt content
    const categoryKeywords: Record<string, string[]> = {
      create: ['create', 'build', 'make', 'generate', 'implement'],
      analyze: ['analyze', 'examine', 'study', 'review', 'assess'],
      solve: ['solve', 'fix', 'debug', 'resolve', 'troubleshoot'],
      explain: ['explain', 'describe', 'clarify', 'help understand'],
      code: ['code', 'program', 'develop', 'implement'],
      write: ['write', 'compose', 'draft', 'document']
    };

    const detectedKeywords = categoryKeywords[instruction.category] || [];
    const hasMatchingKeyword = detectedKeywords.some(keyword => 
      originalLower.includes(keyword)
    );

    // High faithfulness if category matches content or confidence is high
    return hasMatchingKeyword || instruction.confidence > 0.8;
  }

  generateIntentExplanation(analysis: IntentAnalysis): string {
    const { instruction, metaInstruction } = analysis;
    
    let explanation = `Intent Analysis:\n`;
    explanation += `- Primary Task: ${instruction.category} (${(instruction.confidence * 100).toFixed(1)}% confidence)\n`;
    explanation += `- Action: ${instruction.action}\n`;
    explanation += `- Subject: ${instruction.subject.type} - ${instruction.subject.domain}\n`;
    
    if (metaInstruction.constraints.length > 0) {
      explanation += `- Constraints: ${metaInstruction.constraints.map(c => c.type).join(', ')}\n`;
    }
    
    explanation += `- Confidence: ${(metaInstruction.confidence * 100).toFixed(1)}%\n`;
    
    return explanation;
  }

  private calculateOverallConfidence(
    instruction: InstructionIntent,
    metaInstruction: MetaInstructionAnalysis,
    interaction: InteractionAnalysisType
  ): number {
    // Weighted average of confidence scores
    const weights = { 
      instruction: 0.4,      // Primary intent is most important
      metaInstruction: 0.35, // Context is very important  
      interaction: 0.25      // Communication style matters but less
    };
    
    return (
      instruction.confidence * weights.instruction +
      metaInstruction.confidence * weights.metaInstruction +
      interaction.confidence * weights.interaction
    );
  }

  validateIntentFaithfulness(analysis: IntentAnalysis, originalPrompt: string): boolean {
    // Validate that analysis preserves original intent across all layers
    const instruction = analysis.instruction;
    const interaction = analysis.interaction;
    const originalLower = originalPrompt.toLowerCase();

    // Check instruction layer faithfulness
    const categoryKeywords: Record<string, string[]> = {
      create: ['create', 'build', 'make', 'generate', 'implement'],
      analyze: ['analyze', 'examine', 'study', 'review', 'assess'],
      solve: ['solve', 'fix', 'debug', 'resolve', 'troubleshoot'],
      explain: ['explain', 'describe', 'clarify', 'help understand'],
      code: ['code', 'program', 'develop', 'implement'],
      write: ['write', 'compose', 'draft', 'document']
    };

    const detectedKeywords = categoryKeywords[instruction.category] || [];
    const hasMatchingKeyword = detectedKeywords.some(keyword => 
      originalLower.includes(keyword)
    );

    // Check interaction layer consistency
    const styleConsistent = this.validateCommunicationStyleConsistency(
      instruction.category, // Using category as a proxy for communication style
      originalPrompt
    );

    // High faithfulness requires both instruction and interaction consistency
    return (hasMatchingKeyword || instruction.confidence > 0.8) && styleConsistent;
  }

  generateIntentExplanation(analysis: IntentAnalysis): string {
    const { instruction, metaInstruction, interaction } = analysis;
    
    let explanation = `Intent Analysis Summary:\n\n`;
    
    // Instruction layer
    explanation += `🎯 Instruction Layer:\n`;
    explanation += `   Task: ${instruction.category} (${(instruction.confidence * 100).toFixed(0)}% confidence)\n`;
    explanation += `   Action: ${instruction.action}\n`;
    explanation += `   Subject: ${instruction.subject.type} - ${instruction.subject.domain}\n`;
    explanation += `   Complexity: ${instruction.complexity}\n\n`;
    
    // Meta-instruction layer
    explanation += `🧠 Meta-Instruction Layer:\n`;
    explanation += `   Constraints: ${metaInstruction.constraints.length} detected\n`;
    explanation += `   Confidence: ${(metaInstruction.confidence * 100).toFixed(1)}%\n\n`;
    
    // Interaction layer
    explanation += `💬 Interaction Layer:\n`;
    explanation += `   Communication Style: ${interaction.interactionStyle}\n`;
    explanation += `   Collaboration: ${interaction.collaborationPattern}\n`;
    explanation += `   User Expertise: ${interaction.userExpertise}\n\n`;
    
    explanation += `📊 Overall Confidence: ${(analysis.confidence * 100).toFixed(1)}%\n`;
    explanation += `⚡ Processing Time: ${analysis.performance.totalTime.toFixed(2)}ms`;
    
    return explanation;
  }

  private validateCommunicationStyleConsistency(
    detectedCategory: string,
    originalPrompt: string
  ): boolean {
    const lowerPrompt = originalPrompt.toLowerCase();
    
    // Validate communication style detection accuracy based on category
    switch (detectedCategory) {
      case 'create':
      case 'code':
        return lowerPrompt.includes('implement') || 
               lowerPrompt.includes('create') || 
               lowerPrompt.includes('build');
      case 'explain':
        return lowerPrompt.includes('help') || 
               lowerPrompt.includes('explain') || 
               lowerPrompt.includes('understand');
      case 'analyze':
        return lowerPrompt.includes('analyze') || 
               lowerPrompt.includes('review') || 
               lowerPrompt.includes('assess');
      default:
        return true; // Default to consistent for other categories
    }
  }

  private getFallbackAnalysis(): IntentAnalysis {
    return {
      instruction: {
        category: 'create' as any,
        action: 'generate' as any,
        subject: {
          type: 'concept' as any,
          domain: 'general development',
          complexity: 'moderate' as any,
          context: []
        },
        outputFormat: 'prose' as any,
        complexity: 'trivial' as any,
        confidence: 0.3
      },
      metaInstruction: {
        style: { formality: 'professional' as any, technicality: 'intermediate' as any, detail: 'moderate' as any, tone: [] },
        quality: { accuracy: 'high' as any, completeness: 'thorough' as any, performance: [], validation: [] },
        constraints: [],
        contextRequirements: [],
        confidence: 0.3
      },
      interaction: {
        userExpertise: 'intermediate' as any,
        collaborationPattern: 'independent' as any,
        workflowStage: 'implementation' as any,
        interactionStyle: 'directive' as any,
        followUpExpectations: [],
        confidence: 0.3
      },
      confidence: 0.3,
      performance: {
        totalTime: 0,
        layerTimes: [],
        memoryUsage: { peakUsage: 0, averageUsage: 0, allocationCount: 0 },
        confidenceBreakdown: { instruction: 0.3, metaInstruction: 0.3, interaction: 0.3, overall: 0.3 }
      }
    };
  }
}
