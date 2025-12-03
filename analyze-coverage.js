const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const apps = [
  'admin-app',
  'home-app',
  'common-app',
  'budgeting-app',
  'dataManagement-app',
  'entitySetup-app',
  'userManagement-app'
];

// Function to calculate coverage percentage from coverage data
function calculateCoverage(coverageData) {
  const statements = Object.values(coverageData.s || {});
  const coveredStatements = statements.filter(count => count > 0).length;
  const totalStatements = statements.length;
  
  if (totalStatements === 0) return 100; // No statements means 100% (empty file)
  
  return (coveredStatements / totalStatements) * 100;
}

// Function to get uncovered lines
function getUncoveredLines(coverageData) {
  const uncovered = [];
  const statements = coverageData.s || {};
  const statementMap = coverageData.statementMap || {};
  
  Object.keys(statements).forEach(key => {
    if (statements[key] === 0) {
      const statement = statementMap[key];
      if (statement) {
        uncovered.push(statement.start.line);
      }
    }
  });
  
  return [...new Set(uncovered)].sort((a, b) => a - b);
}

// Function to parse coverage-final.json
function parseCoverageFile(coveragePath) {
  try {
    const content = fs.readFileSync(coveragePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${coveragePath}:`, error.message);
    return null;
  }
}

// Function to analyze all apps
function analyzeAllApps() {
  const allFiles = [];
  
  console.log('Analyzing coverage for all apps...\n');
  
  apps.forEach(app => {
    const coveragePath = path.join(app, 'coverage', 'coverage-final.json');
    
    if (!fs.existsSync(coveragePath)) {
      console.log(`⚠️  Coverage file not found for ${app}. Running tests...`);
      try {
        execSync(`cd ${app} && npm test -- --coverage --watchAll=false`, { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
      } catch (error) {
        console.error(`Error running tests for ${app}:`, error.message);
        return;
      }
    }
    
    const coverageData = parseCoverageFile(coveragePath);
    if (!coverageData) return;
    
    Object.keys(coverageData).forEach(filePath => {
      const fileData = coverageData[filePath];
      const coverage = calculateCoverage(fileData);
      const uncoveredLines = getUncoveredLines(fileData);
      
      // Convert absolute path to relative path
      const relativePath = path.relative(process.cwd(), filePath);
      
      allFiles.push({
        app,
        file: relativePath,
        coverage,
        uncoveredLines,
        totalLines: uncoveredLines.length
      });
    });
  });
  
  // Categorize files
  const categories = {
    '0-25%': [],
    '25-50%': [],
    '50-75%': [],
    '75%+': []
  };
  
  allFiles.forEach(file => {
    if (file.coverage < 25) {
      categories['0-25%'].push(file);
    } else if (file.coverage < 50) {
      categories['25-50%'].push(file);
    } else if (file.coverage < 75) {
      categories['50-75%'].push(file);
    } else {
      categories['75%+'].push(file);
    }
  });
  
  // Sort each category by coverage (lowest first)
  Object.keys(categories).forEach(key => {
    categories[key].sort((a, b) => a.coverage - b.coverage);
  });
  
  // Print results
  console.log('\n' + '='.repeat(80));
  console.log('COVERAGE ANALYSIS RESULTS');
  console.log('='.repeat(80) + '\n');
  
  Object.keys(categories).forEach(range => {
    const files = categories[range];
    console.log(`\n📊 ${range} Coverage (${files.length} files):`);
    console.log('-'.repeat(80));
    
    if (files.length === 0) {
      console.log('  No files in this category.');
    } else {
      files.forEach(file => {
        console.log(`  ${file.coverage.toFixed(2)}% - ${file.file}`);
        if (file.uncoveredLines.length > 0 && file.uncoveredLines.length <= 20) {
          console.log(`    Uncovered lines: ${file.uncoveredLines.join(', ')}`);
        } else if (file.uncoveredLines.length > 20) {
          console.log(`    Uncovered lines: ${file.uncoveredLines.slice(0, 20).join(', ')}... (${file.uncoveredLines.length} total)`);
        }
      });
    }
  });
  
  // Save detailed report to file
  const reportPath = 'coverage-analysis-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(categories, null, 2));
  console.log(`\n✅ Detailed report saved to: ${reportPath}`);
  
  return categories;
}

// Run analysis
analyzeAllApps();

