import type { UserProfile } from '@models/user';
import { Constants } from '@utilities/constants';

/**
 * Default login credentials used by UI tests.
 *
 * The form submits an email + password, so we expose just that subset of
 * `UserProfile`. Values are sourced from `Constants` so they can be
 * overridden per environment via the `LOGIN_USERNAME` / `LOGIN_PASSWORD`
 * env vars (see `env.loader.ts`).
 */
export const user: Pick<UserProfile, 'email' | 'password'> = {
  email: Constants.LOGIN_USERNAME,
  password: Constants.LOGIN_PASSWORD,
};
