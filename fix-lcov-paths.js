const fs = require('fs');
const path = require('path');

const apps = ['admin-app', 'home-app', 'common-app', 'budgeting-app', 'dataManagement-app', 'entitySetup-app', 'userManagement-app'];

apps.forEach(app => {
  const lcovPath = path.join(__dirname, app, 'coverage', 'lcov.info');
  if (fs.existsSync(lcovPath)) {
    let content = fs.readFileSync(lcovPath, 'utf8');
    // Replace SF:src\... or SF:src/... with SF:app/src/...
    content = content.replace(/^SF:src[\\/]/gm, `SF:${app}/src/`);
    fs.writeFileSync(lcovPath, content, 'utf8');
    console.log(`Fixed paths in ${lcovPath}`);
  }
});