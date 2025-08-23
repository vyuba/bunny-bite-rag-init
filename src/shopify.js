import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';

import '@shopify/shopify-api/adapters/node';

export default shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: [
    'read_orders',
    'write_orders',
    'read_customers',
    'write_customers',
    'read_products',
  ],
  hostName: new URL(`https://${process.env.NEXT_PUBLIC_SHOPIFY_APP_URL}`).host,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false,
  useOnlineTokens: false,
});
