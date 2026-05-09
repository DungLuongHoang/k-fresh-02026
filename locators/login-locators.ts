import { Locator, Page } from '@playwright/test';
import { CommonLocators } from '@locators/common-locators';

export class LoginLocators extends CommonLocators {

  constructor(page: Page) {
    super(page);
    this.locatorInitialization();
  }

  inputEmail!: Locator;
  inputPassword!: Locator;
  flashMessage!: Locator;

  override locatorInitialization(): void {
    super.locatorInitialization();
    // Prefer attribute/CSS selectors over XPath. Per project conventions, the
    // ideal order is getByRole > getByLabel > getByPlaceholder > getByTestId
    // > text > CSS > XPath. Migrating to role/label-based selectors requires
    // verifying the live a11y tree (MCP exploration), so for now we do the
    // safe XPath → CSS attribute conversion. Upgrade incrementally once the
    // accessible names/roles are confirmed against the live UI.
    this.inputEmail = this.page.locator('input[name="email"]');
    this.inputPassword = this.page.locator('input[name="password"]');
    this.btnSubmit = this.page.locator('input[type="submit"]');
    this.flashMessage = this.page.locator('div#flash');
  }
}
