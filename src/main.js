import { Client, Databases } from 'node-appwrite';
import { pcIndex } from './pinecone.js';
import { shopify } from './shopify.js';

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

  const session = await database.getDocument(
    process.env.DATABASE_ID,
    process.env.SESSION_COLLECTION_ID,
    `offline_${shop}`
  );
  console.log('session:', session);

  if (!session) {
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

    const client = new shopify.clients.Graphql({
      id: session.$id,
      shop: session.shop,
      state: session.state,
      isOnline: session.isOnline,
      scope: session.scope,
      accessToken: session.accessToken,
      expires: session.expires,
      onlineAccessInfo: session.onlineAccessInfo,
    });

    const products = await client.request(queryString);

    // logging when getting products error

    if (products.errors) {
      console.log(products.errors);
      return NextResponse.json({ status: 400, error: products.errors });
    }

    // creating an embedding for the products

    const productsEmbedingResponse = await Promise.all(
      products.data.products.nodes.map(async (product) => {
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
      })
    );

    // Storing in pinecone index

    await pcIndex.upsert(productsEmbedingResponse);

    return res.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    log(error);
    return res.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
};
