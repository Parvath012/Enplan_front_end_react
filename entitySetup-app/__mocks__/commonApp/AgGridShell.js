const React = require('react');

function MockAgGridShell(props) {
  return React.createElement('div', { 'data-testid': 'ag-grid-shell' },
    React.createElement('div', { 'data-testid': 'grid-data' }, JSON.stringify(props.rowData)),
    React.createElement('div', { 'data-testid': 'grid-columns' }, JSON.stringify(props.columnDefs)),
    React.createElement('div', { 'data-testid': 'grid-options' }, JSON.stringify(props.gridOptions))
  );
}

module.exports = MockAgGridShell;





