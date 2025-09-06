/**
 * Heuristic Layer - Domain-Specific Detection Logic
 * Uses specialized heuristics and contextual analysis for edge cases
 */

import { ClassificationLayer, DomainScore } from './ClassificationLayer.js';
import { DomainType } from '../types/DomainTypes.js';

export class HeuristicLayer implements ClassificationLayer {
  name = 'heuristic';
  weight = 0.1;

  classify(prompt: string): DomainScore[] {
    const scores: DomainScore[] = [];
    const cleanPrompt = prompt.toLowerCase();

    // Code-specific heuristics
    const codeScore = this.analyzeCodeHeuristics(cleanPrompt);
    if (codeScore > 0) {
      scores.push({
        domain: DomainType.CODE,
        score: codeScore,
        method: 'heuristic',
        indicators: ['code-specific patterns']
      });
    }

    // Analysis-specific heuristics
    const analysisScore = this.analyzeAnalysisHeuristics(cleanPrompt);
    if (analysisScore > 0) {
      scores.push({
        domain: DomainType.ANALYSIS,
        score: analysisScore,
        method: 'heuristic',
        indicators: ['analysis-specific patterns']
      });
    }

    // Writing-specific heuristics
    const writingScore = this.analyzeWritingHeuristics(cleanPrompt);
    if (writingScore > 0) {
      scores.push({
        domain: DomainType.WRITING,
        score: writingScore,
        method: 'heuristic',
        indicators: ['writing-specific patterns']
      });
    }

    // Research-specific heuristics
    const researchScore = this.analyzeResearchHeuristics(cleanPrompt);
    if (researchScore > 0) {
      scores.push({
        domain: DomainType.RESEARCH,
        score: researchScore,
        method: 'heuristic',
        indicators: ['research-specific patterns']
      });
    }

    return scores;
  }

  private analyzeCodeHeuristics(prompt: string): number {
    let score = 0;

    // Language specifiers
    const languages = ['python', 'javascript', 'java', 'typescript', 'c++', 'react', 'node', 'html', 'css'];
    if (languages.some(lang => prompt.includes(lang))) {
      score += 0.3;
    }

    // Code structure terms
    const codeTerms = ['function', 'class', 'method', 'variable', 'array', 'loop', 'condition', 'api', 'database'];
    const codeTermCount = codeTerms.filter(term => prompt.includes(term)).length;
    score += codeTermCount * 0.1;

    // Programming context indicators
    const programmingContexts = ['software', 'application', 'system', 'program', 'code', 'algorithm'];
    const contextCount = programmingContexts.filter(context => prompt.includes(context)).length;
    score += contextCount * 0.05;

    // Technical implementation patterns
    if (prompt.includes('implement') && (prompt.includes('algorithm') || prompt.includes('function'))) {
      score += 0.2;
    }

    return Math.min(score, 0.8);
  }

  private analyzeAnalysisHeuristics(prompt: string): number {
    let score = 0;

    // Quantitative terms
    const quantitativeTerms = ['data', 'metrics', 'statistics', 'numbers', 'figures', 'results', 'trends'];
    const quantCount = quantitativeTerms.filter(term => prompt.includes(term)).length;
    score += quantCount * 0.1;

    // Comparison structure
    const comparisonTerms = ['compare', 'contrast', 'versus', 'vs', 'against', 'between'];
    if (comparisonTerms.some(term => prompt.includes(term))) {
      score += 0.2;
    }

    // Analysis verbs with objects
    const analysisVerbs = ['analyze', 'evaluate', 'assess', 'examine', 'study'];
    const analysisObjects = ['data', 'performance', 'results', 'trends', 'patterns'];
    
    for (const verb of analysisVerbs) {
      for (const obj of analysisObjects) {
        if (prompt.includes(verb) && prompt.includes(obj)) {
          score += 0.15;
          break;
        }
      }
    }
    
    // Reduce score for comparative evaluation (should favor research domain)
    if (prompt.includes('evaluate') && (prompt.includes('different') || prompt.includes('platforms') || prompt.includes('tools') || prompt.includes('options'))) {
      score -= 0.15; // Favor research over analysis for comparative evaluation - increased penalty
    }

    // Business analysis indicators
    const businessTerms = ['market', 'business', 'financial', 'customer', 'sales', 'roi', 'growth'];
    const businessCount = businessTerms.filter(term => prompt.includes(term)).length;
    score += businessCount * 0.05;

    return Math.min(score, 0.8);
  }

  private analyzeWritingHeuristics(prompt: string): number {
    let score = 0;

    // Content type indicators
    const contentTypes = ['article', 'blog', 'post', 'essay', 'story', 'document', 'report', 'newsletter'];
    const contentTypeCount = contentTypes.filter(type => prompt.includes(type)).length;
    score += contentTypeCount * 0.15;

    // Writing action patterns
    const writingActions = ['write', 'create', 'compose', 'draft', 'author', 'publish'];
    const actionCount = writingActions.filter(action => prompt.includes(action)).length;
    score += actionCount * 0.1;

    // Communication context
    const communicationTerms = ['explain', 'describe', 'document', 'outline', 'summarize', 'present'];
    const commCount = communicationTerms.filter(term => prompt.includes(term)).length;
    score += commCount * 0.05;

    // Audience indicators
    const audienceTerms = ['readers', 'audience', 'stakeholders', 'customers', 'users'];
    if (audienceTerms.some(term => prompt.includes(term))) {
      score += 0.1;
    }

    // Creative writing indicators
    const creativeTerms = ['creative', 'fictional', 'narrative', 'storytelling', 'imaginative'];
    if (creativeTerms.some(term => prompt.includes(term))) {
      score += 0.15;
    }

    return Math.min(score, 0.8);
  }

  private analyzeResearchHeuristics(prompt: string): number {
    let score = 0;

    // Research action patterns
    const researchActions = ['research', 'investigate', 'explore', 'study', 'find', 'discover'];
    const actionCount = researchActions.filter(action => prompt.includes(action)).length;
    score += actionCount * 0.1;

    // Planning and strategy patterns (often research-oriented)
    const planningTerms = ['outline', 'plan', 'strategy', 'roadmap', 'goals', 'objectives', 'requirements'];
    const planningCount = planningTerms.filter(term => prompt.includes(term)).length;
    // Special boost for planning combinations
    if (prompt.includes('outline') && (prompt.includes('goals') || prompt.includes('objectives'))) {
      score += 0.4; // Strong planning signal - boosted for reliability
    } else {
      score += planningCount * 0.08;
    }

    // Methodology indicators
    const methodologyTerms = ['best practices', 'methodologies', 'approaches', 'techniques', 'methods', 'frameworks'];
    const methodCount = methodologyTerms.filter(term => prompt.includes(term)).length;
    score += methodCount * 0.15;

    // Solution-seeking patterns
    const solutionTerms = ['solutions', 'tools', 'platforms', 'options', 'alternatives', 'recommendations'];
    const solutionCount = solutionTerms.filter(term => prompt.includes(term)).length;
    score += solutionCount * 0.1;

    // Technology domain indicators
    const techDomains = ['agile', 'devops', 'security', 'ux', 'ui', 'machine learning', 'ai', 'blockchain'];
    const techCount = techDomains.filter(domain => prompt.includes(domain)).length;
    score += techCount * 0.1;

    // Question patterns (research often involves questions)
    if (prompt.includes('?') || prompt.includes('how') || prompt.includes('what') || prompt.includes('which')) {
      score += 0.05;
    }

    // Comparative research patterns
    if (prompt.includes('compare') && (prompt.includes('tools') || prompt.includes('platforms') || prompt.includes('solutions'))) {
      score += 0.2;
    }
    
    // Evaluation and assessment patterns (comparative research)
    if (prompt.includes('evaluate') && (prompt.includes('different') || prompt.includes('platforms') || prompt.includes('tools') || prompt.includes('options'))) {
      score += 0.35; // Strong research signal for evaluation tasks - boosted
    }

    return Math.min(score, 0.8);
  }
}
