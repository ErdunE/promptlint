/**
 * Template Registry - ES Module
 * 
 * Central registry for all template implementations
 * Chrome Extension Compatible - Browser APIs Only
 */

import { TemplateType, TemplateRegistryEntry, IBaseTemplate } from '../types/TemplateTypes.js';
import { TaskIOTemplate } from './TaskIOTemplate.js';
import { BulletTemplate } from './BulletTemplate.js';
import { SequentialTemplate } from './SequentialTemplate.js';
import { MinimalTemplate } from './MinimalTemplate.js';

/**
 * Template registry with all available templates
 */
export const TEMPLATE_REGISTRY: TemplateRegistryEntry[] = [
  {
    type: TemplateType.TASK_IO,
    templateClass: TaskIOTemplate,
    metadata: {
      name: 'Task I/O Template',
      description: 'Structured format with clear task definition and I/O specifications',
      category: 'structured',
      complexity: 'medium' as const,
      suitableFor: ['programming', 'analysis', 'data processing']
    },
    priority: 80,
    enabled: true
  },
  {
    type: TemplateType.BULLET,
    templateClass: BulletTemplate,
    metadata: {
      name: 'Bullet Point Template',
      description: 'Structured format using bullet points for clear requirements',
      category: 'structured',
      complexity: 'low' as const,
      suitableFor: ['general', 'writing', 'planning']
    },
    priority: 70,
    enabled: true
  },
  {
    type: TemplateType.SEQUENTIAL,
    templateClass: SequentialTemplate,
    metadata: {
      name: 'Sequential Steps Template',
      description: 'Numbered steps format for sequential processes',
      category: 'process',
      complexity: 'medium' as const,
      suitableFor: ['procedures', 'workflows', 'tutorials']
    },
    priority: 60,
    enabled: true
  },
  {
    type: TemplateType.MINIMAL,
    templateClass: MinimalTemplate,
    metadata: {
      name: 'Minimal Template',
      description: 'Basic cleanup for well-structured prompts',
      category: 'minimal',
      complexity: 'low' as const,
      suitableFor: ['simple', 'well-formed', 'quick']
    },
    priority: 50,
    enabled: true
  }
];

/**
 * Get all available template types
 */
export function getAvailableTemplateTypes(): TemplateType[] {
  return TEMPLATE_REGISTRY
    .filter(entry => entry.enabled)
    .map(entry => entry.type);
}

/**
 * Get template registry entry by type
 */
export function getTemplateEntry(type: TemplateType): TemplateRegistryEntry | undefined {
  return TEMPLATE_REGISTRY.find(entry => entry.type === type);
}

/**
 * Get template class by type
 */
export function getTemplateClass(type: TemplateType): (new () => IBaseTemplate) | undefined {
  const entry = getTemplateEntry(type);
  return entry?.templateClass;
}

/**
 * Create template instance by type
 */
export function createTemplate(type: TemplateType): IBaseTemplate | undefined {
  const TemplateClass = getTemplateClass(type);
  return TemplateClass ? new TemplateClass() : undefined;
}

/**
 * Get all enabled template instances
 */
export function getAllTemplates(): IBaseTemplate[] {
  return TEMPLATE_REGISTRY
    .filter(entry => entry.enabled)
    .map(entry => new entry.templateClass());
}

/**
 * Get templates sorted by priority
 */
export function getTemplatesByPriority(): IBaseTemplate[] {
  return TEMPLATE_REGISTRY
    .filter(entry => entry.enabled)
    .sort((a, b) => b.priority - a.priority)
    .map(entry => new entry.templateClass());
}

// Export individual template classes
export { BaseTemplate } from './BaseTemplate.js';
export { TaskIOTemplate } from './TaskIOTemplate.js';
export { BulletTemplate } from './BulletTemplate.js';
export { SequentialTemplate } from './SequentialTemplate.js';
export { MinimalTemplate } from './MinimalTemplate.js';
