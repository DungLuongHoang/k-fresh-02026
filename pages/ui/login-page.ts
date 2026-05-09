import test, { Page } from '@playwright/test';
import { UserProfile } from '@models/user';
import { Constants } from '@utilities/constants';
import { LoginLocators } from '@locators/login-locators';
import { step } from '@utilities/logging';
import { CommonPage } from '@pages/common-page';
import { AssertHelper } from '@utilities/assert-helper';

export class LoginPage extends LoginLocators {

  commonPage: CommonPage;
  assertHelper: AssertHelper;
  constructor(page: Page) {
    super(page);
    this.commonPage = new CommonPage(page);
    this.assertHelper = new AssertHelper();
  }
  /**
   * Navigates to the login page URL directly.
   * Prefer using HomePage navigation for account menu flow tests.
   * @param url Login page URL.
   */
  @step('Navigating to Login page')
  async goto(url: string = Constants.LOGIN_URL): Promise<void> {
    await this.commonPage.goto(url);
  }

  /**
   *  Logs in using the provided user credentials.
   * @param user An object containing the email and password for login.
   *             Accepts any object satisfying `Pick<UserProfile, 'email' | 'password'>`,
   *             so lightweight credential fixtures don't need to provide the full profile.
   */
  @step('Log in with user credentials')
  async login(user: Pick<UserProfile, 'email' | 'password'>): Promise<void> {
    await test.step(`Log in with username: ${user.email}`, async () => {
      await this.commonPage.goto(Constants.LOGIN_URL);
      await this.commonPage.fill(this.inputEmail, user.email);
      await this.commonPage.fill(this.inputPassword, user.password);
      await this.commonPage.click(this.btnSubmit);
    });
  }
}
