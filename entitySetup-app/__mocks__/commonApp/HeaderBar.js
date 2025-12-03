const React = require('react');

function MockHeaderBar({ title, RightAction }) {
  return React.createElement('div', { 'data-testid': 'header-bar' },
    React.createElement('h1', null, title),
    RightAction
  );
}

module.exports = MockHeaderBar;





