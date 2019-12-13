
Given(/^there is a document "([^"]*)" with the field "([^"]*)" set to (\d+) in collection "([^"]*)"$/, (id, field, value, collection) => {
  cy.task('db:update', { collection, id, field, value })
});

Then(/^the count (\d+) is in the element "([^"]*)"$/, (count, field) => {
  cy.get(field).contains(count);
});

Then(/^there is a document "([^"]*)" with the js "([^"]*)" in collection "([^"]*)"$/, (doc, js, collection) => {
  cy.fixture(js).then((data) => cy.task('db:project:save', { collection, doc, data }));
});

Then(/^total count of element "([^"]*)" is (\d+)$/, (field, count) => {
  cy.get(field).should('have.length', count);
});