import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface TypeScriptError {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
}

interface ErrorReport {
  timestamp: string;
  totalErrors: number;
  errorsByPackage: Record<string, number>;
  errorsByType: Record<string, number>;
  errorDetails: TypeScriptError[];
}

// Run TypeScript compiler and capture errors
const output = execSync('npx tsc --noEmit --pretty false 2>&1', {
  cwd: process.cwd(),
  encoding: 'utf-8',
  maxBuffer: 10 * 1024 * 1024 // 10MB buffer
}).toString();

// Parse TypeScript errors
const errors: TypeScriptError[] = [];
const errorPattern = /(.+)\((\d+),(\d+)\): error (TS\d+): (.+)/g;
let match;

while ((match = errorPattern.exec(output)) !== null) {
  // Skip node_modules
  if (match[1].includes('node_modules')) continue;
  
  errors.push({
    file: match[1],
    line: parseInt(match[2]),
    column: parseInt(match[3]),
    code: match[4],
    message: match[5]
  });
}

// Group errors by package
const errorsByPackage: Record<string, number> = {};
const errorsByType: Record<string, number> = {};

errors.forEach(error => {
  // Determine package
  const packageMatch = error.file.match(/packages\/([^\/]+)\//);
  const appMatch = error.file.match(/apps\/([^\/]+)\//);
  const scriptMatch = error.file.match(/scripts\//);
  
  let pkg = 'root';
  if (packageMatch) pkg = `packages/${packageMatch[1]}`;
  else if (appMatch) pkg = `apps/${appMatch[1]}`;
  else if (scriptMatch) pkg = 'scripts';
  
  errorsByPackage[pkg] = (errorsByPackage[pkg] || 0) + 1;
  errorsByType[error.code] = (errorsByType[error.code] || 0) + 1;
});

// Generate report
const report: ErrorReport = {
  timestamp: new Date().toISOString(),
  totalErrors: errors.length,
  errorsByPackage,
  errorsByType,
  errorDetails: errors
};

// Write JSON report
fs.writeFileSync('typescript-error-report.json', JSON.stringify(report, null, 2));

// Generate Markdown report
let markdown = `# TypeScript Error Report
Generated: ${report.timestamp}
Total Errors: ${report.totalErrors}

## Errors by Package
| Package | Error Count |
|---------|-------------|
`;

Object.entries(errorsByPackage)
  .sort((a, b) => b[1] - a[1])
  .forEach(([pkg, count]) => {
    markdown += `| ${pkg} | ${count} |\n`;
  });

markdown += `
## Errors by Type
| Error Code | Count | Description |
|------------|-------|-------------|
`;

const errorDescriptions: Record<string, string> = {
  'TS2339': 'Property does not exist',
  'TS2345': 'Argument type mismatch',
  'TS2322': 'Type assignment error',
  'TS7006': 'Parameter implicitly has any type',
  'TS2304': 'Cannot find name',
  'TS2571': 'Object is of type unknown',
  'TS18046': 'Element implicitly has any type',
  // Add more as needed
};

Object.entries(errorsByType)
  .sort((a, b) => b[1] - a[1])
  .forEach(([code, count]) => {
    const desc = errorDescriptions[code] || 'Other';
    markdown += `| ${code} | ${count} | ${desc} |\n`;
  });

markdown += `
## Detailed Error List
`;

// Group errors by file
const errorsByFile: Record<string, TypeScriptError[]> = {};
errors.forEach(error => {
  if (!errorsByFile[error.file]) errorsByFile[error.file] = [];
  errorsByFile[error.file].push(error);
});

Object.entries(errorsByFile)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([file, fileErrors]) => {
    markdown += `\n### ${file} (${fileErrors.length} errors)\n`;
    fileErrors.forEach(error => {
      markdown += `- Line ${error.line}:${error.column} - ${error.code}: ${error.message}\n`;
    });
  });

fs.writeFileSync('typescript-error-report.md', markdown);

console.log(`Report generated:
- typescript-error-report.json (structured data)
- typescript-error-report.md (readable report)
Total errors found: ${report.totalErrors}`);
