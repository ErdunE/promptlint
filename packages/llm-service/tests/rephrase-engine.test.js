/**
 * PromptLint LLM Service - Rephrase Engine Tests
 *
 * Basic tests for the rephrase functionality
 * Note: These tests use mock data and don't make actual API calls
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RephraseEngine } from '../src/api/rephrase-engine';
// Mock OpenAI client
vi.mock('../src/api/openai-client', () => ({
    OpenAIClient: vi.fn().mockImplementation(() => ({
        isAvailable: vi.fn().mockResolvedValue(true),
        getStatus: vi.fn().mockReturnValue({
            configured: true,
            apiKeyValid: true,
            rateLimit: {
                remainingMinute: 20,
                remainingHour: 100,
                minuteResetTime: Date.now() + 60000,
                hourResetTime: Date.now() + 3600000
            }
        }),
        configure: vi.fn(),
        generateCompletion: vi.fn().mockResolvedValue({
            content: 'Implement a quicksort sorting algorithm in Python that takes an array of integers as input and returns a sorted array in ascending order.',
            tokensUsed: 25,
            model: 'gpt-3.5-turbo',
            processingTime: 150
        }),
        estimateCost: vi.fn().mockReturnValue(0.001)
    }))
}));
describe('RephraseEngine', () => {
    let rephraseEngine;
    let mockConfig;
    beforeEach(() => {
        mockConfig = {
            apiKey: 'sk-test-key-1234567890123456789012345678901234567890',
            model: 'gpt-3.5-turbo',
            timeout: 30000,
            maxRetries: 3,
            temperature: 0.7,
            maxTokens: 1000,
            rateLimit: {
                requestsPerMinute: 20,
                requestsPerHour: 100
            }
        };
        rephraseEngine = new RephraseEngine(mockConfig);
    });
    describe('Basic Functionality', () => {
        it('should create a RephraseEngine instance', () => {
            expect(rephraseEngine).toBeInstanceOf(RephraseEngine);
        });
        it('should be available when properly configured', async () => {
            const available = await rephraseEngine.isAvailable();
            expect(available).toBe(true);
        });
        it('should return proper service status', () => {
            const status = rephraseEngine.getStatus();
            expect(status.configured).toBe(true);
            expect(status.apiKeyValid).toBe(true);
            expect(status.rateLimit.remainingMinute).toBeGreaterThan(0);
        });
    });
    describe('Rephrase Functionality', () => {
        it('should rephrase a simple prompt with multiple candidates', async () => {
            const request = {
                originalPrompt: 'write sorting code',
                candidateCount: 3
            };
            const result = await rephraseEngine.rephrase(request);
            expect(result.originalPrompt).toBe('write sorting code');
            expect(result.candidates).toHaveLength(3);
            expect(result.metadata.processingTime).toBeGreaterThan(0);
            expect(result.metadata.model).toBe('gpt-3.5-turbo');
            // Check candidate structure
            result.candidates.forEach(candidate => {
                expect(candidate).toHaveProperty('id');
                expect(candidate).toHaveProperty('text');
                expect(candidate).toHaveProperty('approach');
                expect(candidate).toHaveProperty('estimatedScore');
                expect(candidate).toHaveProperty('improvements');
                expect(candidate).toHaveProperty('length');
                expect(candidate.estimatedScore).toBeGreaterThanOrEqual(0);
                expect(candidate.estimatedScore).toBeLessThanOrEqual(100);
            });
        });
        it('should handle context in rephrase requests', async () => {
            const request = {
                originalPrompt: 'create data analysis tool',
                candidateCount: 2,
                context: {
                    targetSystem: 'ChatGPT',
                    domain: 'analysis',
                    responseStyle: 'technical'
                }
            };
            const result = await rephraseEngine.rephrase(request);
            expect(result.candidates).toHaveLength(2);
            expect(result.originalPrompt).toBe('create data analysis tool');
        });
        it('should validate rephrase requests', async () => {
            // Test empty prompt
            await expect(rephraseEngine.rephrase({
                originalPrompt: '',
                candidateCount: 2
            })).rejects.toThrow();
            // Test invalid candidate count
            await expect(rephraseEngine.rephrase({
                originalPrompt: 'valid prompt',
                candidateCount: 10 // Too many
            })).rejects.toThrow();
        });
        it('should generate appropriate approaches for different prompts', async () => {
            const codeRequest = {
                originalPrompt: 'build authentication system',
                candidateCount: 3
            };
            const result = await rephraseEngine.rephrase(codeRequest);
            // Should include structured approach for code-related prompts
            const approaches = result.candidates.map(c => c.approach);
            expect(approaches).toContain('structured');
        });
        it('should estimate quality scores appropriately', async () => {
            const request = {
                originalPrompt: 'maybe do something with data somehow',
                candidateCount: 2
            };
            const result = await rephraseEngine.rephrase(request);
            // All candidates should have reasonable scores
            result.candidates.forEach(candidate => {
                expect(candidate.estimatedScore).toBeGreaterThanOrEqual(0);
                expect(candidate.estimatedScore).toBeLessThanOrEqual(100);
            });
        });
    });
    describe('Configuration', () => {
        it('should allow configuration updates', () => {
            const newConfig = {
                model: 'gpt-4',
                temperature: 0.5
            };
            rephraseEngine.configure(newConfig);
            // Configuration should be updated (verified through behavior)
            expect(() => rephraseEngine.configure(newConfig)).not.toThrow();
        });
    });
    describe('Error Handling', () => {
        it('should handle invalid prompts gracefully', async () => {
            await expect(rephraseEngine.rephrase({
                originalPrompt: '',
                candidateCount: 1
            })).rejects.toThrow();
        });
        it('should handle configuration errors', () => {
            expect(() => new RephraseEngine({
                apiKey: '', // Invalid API key
                model: 'gpt-3.5-turbo'
            })).not.toThrow(); // Should create but not work
        });
    });
    describe('Performance', () => {
        it('should complete rephrasing within reasonable time', async () => {
            const startTime = Date.now();
            await rephraseEngine.rephrase({
                originalPrompt: 'create a simple calculator',
                candidateCount: 2
            });
            const duration = Date.now() - startTime;
            // Should complete within 5 seconds (generous for testing)
            expect(duration).toBeLessThan(5000);
        });
        it('should track token usage and costs', async () => {
            const result = await rephraseEngine.rephrase({
                originalPrompt: 'implement binary search',
                candidateCount: 2
            });
            expect(result.metadata.tokensUsed).toBeGreaterThan(0);
            expect(result.metadata.estimatedCost).toBeGreaterThan(0);
        });
    });
});
describe('Integration Tests', () => {
    it('should work with realistic prompts', async () => {
        const config = {
            apiKey: 'sk-test-key-1234567890123456789012345678901234567890',
            model: 'gpt-3.5-turbo'
        };
        const engine = new RephraseEngine(config);
        const testPrompts = [
            'write code',
            'help me debug this error',
            'create responsive website',
            'analyze sales data',
            'build REST API'
        ];
        for (const prompt of testPrompts) {
            const result = await engine.rephrase({
                originalPrompt: prompt,
                candidateCount: 2
            });
            expect(result.candidates).toHaveLength(2);
            expect(result.originalPrompt).toBe(prompt);
            expect(result.metadata.processingTime).toBeGreaterThan(0);
        }
    });
});
//# sourceMappingURL=rephrase-engine.test.js.map