# Coding Standards
- Use **TypeScript** for type safety.  
- Follow **Playwright best practices** (e.g., role-based locators, Page Object Model).  
- Write **clear, maintainable code** with meaningful comments.  
- Use **async/await** for asynchronous operations.  
- Apply consistent naming conventions:  
  - `camelCase` → variables, functions  
  - `PascalCase` → classes, interfaces  
  - `UPPER_CASE` → constants  
- Modularize code to **promote reusability**.  
- Adhere to **DRY (Don’t Repeat Yourself)** principles.  
- Enforce linting & formatting with **ESLint + Prettier**.  
- Commit messages must be **clear and descriptive**.  
- Tests should be **readable, maintainable, and meaningful**.  
- Use **descriptive test names** that convey intent.  

---

# Testing Guidelines
- Each test must be **independent and idempotent**.  
- Ensure tests are **reliable, not flaky**.  
- Use **fixtures** for setup/teardown.  
- Validate both **UI elements** and **backend responses**.  
- Organize tests by **features and scenarios**.  
- Tag tests (`@smoke`, `@regression`, etc.) for selective execution.  

---

# Documentation
- Keep an **up-to-date README** with setup & usage instructions.  
- Document **complex logic** and design decisions in code comments.  
- Maintain a **CHANGELOG** for significant updates.  
- Use **JSDoc** for functions, classes, and utilities.  
- Ensure **documentation matches code** (sync regularly).  
- Provide **examples** for common tasks and usage.  
- Add **troubleshooting tips & FAQs**.  
- Maintain **test case documentation** with scenarios & expected outcomes.  

---

# Version Control
- Use **Git** with meaningful commit messages.  
- Follow a **branching strategy** (e.g., GitFlow, feature branches).  
- Merge changes **frequently** to avoid conflicts.  
- **Tag releases** for traceability.  
- Use **Pull Requests** for reviews before merging.  

---

# Review Process
- All code must undergo **peer review** via Pull Requests.  
- Use **automated static analysis** (SonarQube, ESLint) for quality checks.  
- Verify **test coverage** before merging.  
- Maintain a **review checklist** for consistency.  
- Encourage **constructive feedback** and **knowledge sharing**.  

---

# Continuous Integration (CI)
- Integrate with CI tools (e.g., **GitHub Actions**, **Azure DevOps Pipelines**).  
- Run automated **tests on pull requests and merges**.  
- Ensure **tests pass before merging**.  
- Enforce coding standards and run **linters in CI**.  
- Monitor pipelines and resolve **failures promptly**.  

---

# Maintenance
- Regularly **update dependencies** (npm packages, Playwright, etc.).  
- **Refactor** code for performance & readability.  
- Review test cases for **ongoing relevance**.  
- Archive or remove **obsolete tests**.  
- Track **technical debt** and address it proactively.  

---

# Ignore
- Do **not commit sensitive information** (passwords, API keys, tokens).  
- Avoid hardcoding values → use **environment variables** or config files.  
- Do not commit **large generated files** (test results, screenshots).  
- Add proper entries in **.gitignore** for logs, cache, temp files.
