import { resolve } from 'path';
import { readJsonFile } from '@utilities/jsonHandling';
import { Product } from '@models/product';
import { ENV } from '@models/index';

const productsJsonPath = resolve(__dirname, 'products.json');
const productsByEnv: Record<string, Product> = readJsonFile(productsJsonPath);

/**
 * Retrieves the product data object for the specified environment from the JSON file.
 * Defaults to the ENV environment variable, falling back to "production".
 * @param env - The environment key to look up (e.g., "qa", "staging", "production")
 * @returns The product data object for the specified environment
 */
export function getEnvProduct(
  env: string = (process.env['ENV'] as ENV) || 'production',
): Product {
  // `productsByEnv[env]` is `Product | undefined` under noUncheckedIndexedAccess.
  // Falling through to `production` ensures we always return a real Product or
  // throw a clear error instead of a silent `undefined`.
  const product = productsByEnv[env] ?? productsByEnv['production'];
  if (!product) {
    throw new Error(`No product data for env "${env}" and no "production" fallback in products.json`);
  }
  return product;
}
