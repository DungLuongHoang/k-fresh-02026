<!-- 
Merge Request Title Format: `${ticket_or_type}/${title}` 
Example: `feat/PROJ-123/add-login-button` or `PROJ-123/add-login-button`
-->

## Summary of Changes
<!-- Provide a brief description of what this MR does and why it is needed. -->
- 
- 

## Testing Performed
<!-- Describe the testing that was performed to validate the changes. -->
- [ ] `npm run check:all` passes locally
- Test Coverage: `XX%` (Target: >80%)

## Screenshots / Recordings
<!-- If there are UI changes, include before and after screenshots or screen recordings here. -->
| Before | After |
| ------ | ----- |
|        |       |

## Deployment Notes
<!-- Include any special instructions for deployment (e.g., database migrations needed, feature flags to toggle, new environment variables). -->
- 

## Related Issues / Tickets
<!-- Link to related issue numbers (e.g., Fixes #123, Resolves PROJ-456) -->
- Relates to: 

## Breaking Changes
<!-- If a breaking change is made, describe what is breaking and the migration path for users/consumers. Otherwise state "None". -->
- 

## Self-Review Checklist
<!-- To be completed by the requester before the review begins -->
- [ ] The amount of files changed is small and strictly related. (If the footprint is too large, the work must be partitioned into multiple separate merge requests).
- [ ] I have run `npm run check:all` locally and it passed.
- [ ] **Architecture Checks:** No inline `this.page` usage.
- [ ] **Directory Rules:**
  - `models` are strictly placed in `models/`.
  - `tests` are strictly placed in `tests/`.
  - `locators` are strictly placed in `locators/`.
  - `data` is strictly placed in `data/` (If data files are too big, an alternative storage method must be used).
- [ ] **Clean Commit:** No temporary files, log files, or trash files are included.
- [ ] Code style and formatting is correct with no missing error handling.

---
*This merge request was created/updated by AI.*
