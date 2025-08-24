import { Client, Databases } from 'node-appwrite';
import { pcIndex } from './pinecone.js';
import { shopify } from './shopify.js';
import { Session } from '@shopify/shopify-api';
import { model } from './openai.js';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  // You can use the Appwrite SDK to interact with other services
  // For this example, we're using the Users service
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');

  const database = new Databases(client);

  const { shop, $id } = req.bodyJson;

  //init shopify

  // const { shopify, appwritesessionStorage } = await getShopify();

  const response = await database.getDocument(
    process.env.DATABASE_ID,
    process.env.SESSION_COLLECTION_ID,
    `offline_${shop}`
  );
  console.log('session:', response);

  if (!response) {
    return res.json({ error: 'Could not find a session' }, { status: 404 });
  }

  try {
    //query for getting products

    const queryString = `query {
            products(first: 10) {
                nodes {
                    id
                    title
                    description
                    priceRangeV2 {
                      minVariantPrice {
                        amount
                        currencyCode
                      }
                      maxVariantPrice {
                        amount
                        currencyCode
                      }
                    }
                }
            }
          }`;
    // shopify client initialization
    const cleanDocument = {
      id: response.$id,
      shop: response.shop,
      state: response.state,
      isOnline: response.isOnline,
      scope: response.scope,
      accessToken: response.accessToken,
      expires: response.expires,
      onlineAccessInfo: response.onlineAccessInfo,
    };

    const session = new Session(cleanDocument);

    const client = new shopify.clients.Graphql({ session });

    const products = await client.request(queryString);

    // logging when getting products error

    if (products.errors) {
      console.log(products.errors);
      return res.json({ status: 400, error: products.errors });
    }

    // creating an embedding for the products

    const productsEmbedingResponse = await Promise.all(
      products.data.products.nodes.map(async (product) => {
        try {
          const productsEmbeding = await model.embedQuery(
            // JSON.stringify(product)
            `${product.title}. ${product.description}. ${product.priceRangeV2.minVariantPrice.amount}`
          );
          return {
            id: product.id,
            values: productsEmbeding,
            metadata: {
              title: product.title,
              description: product.description,
              price: product.priceRangeV2.minVariantPrice.amount,
              shop: shop,
              shopId: $id,
            },
          };
        } catch (err) {
          log('Embedding error:', err.message);
          return null;
        }
      })
    );

    // Storing in pinecone index

    await pcIndex.upsert(productsEmbedingResponse);

    return res.json(
      {
        success: true,
      },
      200
    );
  } catch (error) {
    log(error);
    return res.json(
      {
        success: false,
      },
      500
    );
  }
};
