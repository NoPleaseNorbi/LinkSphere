const path = require('path');

module.exports = {
  testMatch: ['**/__tests__/**/*.test.js'],
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        pageTitle: 'LinkSphere Test Report',
        publicPath: path.join(__dirname, 'reports'),
        filename: 'test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: false,
        expand: true,
      }
    ]
  ]
};