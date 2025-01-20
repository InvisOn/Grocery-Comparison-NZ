/// <reference types="cypress" />

// https://on.cypress.io/introduction-to-cypress
// Use the following to log terminal: `cy.task("log", "my message")`

describe("test /home", () => {
    beforeEach(() => {
        cy.visit('http://client:5173/')
    })

    it("display welcome message", () => {
        cy.task('log', Cypress.config().baseUrl)
        cy.visit("/home").get(".container").contains("Welcome to the Grocery Comparison from server!")
    })
})
