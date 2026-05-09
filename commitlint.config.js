/**
 * Commitlint configuration.
 *
 * Extends the Conventional Commits preset and is invoked by the husky
 * `commit-msg` hook (see `.husky/commit-msg`).
 *
 * Allowed types: build, chore, ci, docs, feat, fix, perf, refactor,
 * revert, style, test.
 *
 * Examples:
 *   feat(login): allow remembered email after logout
 *   fix(cart): correct discount calculation for promo codes
 *   chore: bump playwright to 1.59
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow sentence-case subjects (e.g. "chore: Add cool stuffs").
    // Conventional default forbids sentence-case/start-case/pascal-case/upper-case.
    'subject-case': [
      2,
      'never',
      ['pascal-case', 'upper-case'],
    ],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [1, 'always', 120],
  },
};
