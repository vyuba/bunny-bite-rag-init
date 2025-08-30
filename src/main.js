// import { Client, Databases, ID } from 'node-appwrite';
// import { pcIndex } from './pinecone.js';
// import { shopify } from './shopify.js';
// import { Session } from '@shopify/shopify-api';
// import { model } from './openai.js';

export default async ({ req, res, log, error }) => {
  try {
    log('req headers', req.headers);
    const event = req.headers['x-appwrite-event'];
    const doc = req.bodyJson;

    const response = await fetch(
      `https://bunny-bite.vercel.app/api/webhooks/appwrite/rag-products`,
      {
        method: 'POST',
        headers: req.headers,
        body: JSON.stringify(req.bodyJson),
      }
    );

    // const client = new Client()
    //   .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    //   .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    //   .setKey(req.headers['x-appwrite-key'] ?? '');

    // const database = new Databases(client);

    // if (!doc) {
    //   log('No document payload found');
    //   return res.json({ ok: false }, 400);
    // }

    // // Common fields
    // const {
    //   $id,
    //   shop,
    //   user,
    //   shop_number,
    //   twillio_auth_token,
    //   twillio_account_siid,
    // } = doc;

    // // Create event
    // if (event.includes('.create')) {
    //   // 1. List Pinecone namespaces
    //   const nsList = await pcIndex.listNamespaces();
    //   const exists = nsList.namespaces.find((ns) => ns.name === `__${shop}__`);

    //   if (exists) {
    //     // Notify user because shop already exists
    //     await database.createDocument(
    //       process.env.DATABASE_ID,
    //       process.env.APPWRITE_NOTIFICATION_COLLECTION_ID,
    //       ID.unique(),
    //       {
    //         user_id: user,
    //         message:
    //           'You already added the namespace added details. Thank you!',
    //       }
    //     );
    //     return res.json({ ok: true }, 200);
    //   }

    //   // 2. Fetch products from Shopify

    //   //init shopify

    //   // const { shopify, appwritesessionStorage } = await getShopify();

    //   const response = await database.getDocument(
    //     process.env.DATABASE_ID,
    //     process.env.SESSION_COLLECTION_ID,
    //     `offline_${shop}`
    //   );
    //   log('session:', response);

    //   if (!response) {
    //     return res.json({ error: 'Could not find a session' }, { status: 404 });
    //   }
    //   //query for getting products

    //   const queryString = `query {
    //   products(first: 10) {
    //       nodes {
    //           id
    //           title
    //           description
    //           priceRangeV2 {
    //             minVariantPrice {
    //               amount
    //               currencyCode
    //             }
    //             maxVariantPrice {
    //               amount
    //               currencyCode
    //             }
    //           }
    //       }
    //   }
    // }`;
    //   // shopify client initialization
    //   const cleanDocument = {
    //     id: response.$id,
    //     shop: response.shop,
    //     state: response.state,
    //     isOnline: response.isOnline,
    //     scope: response.scope,
    //     accessToken: response.accessToken,
    //     expires: response.expires,
    //     onlineAccessInfo: response.onlineAccessInfo,
    //   };

    //   const session = new Session(cleanDocument);

    //   const client = new shopify.clients.Graphql({ session });

    //   const products = await client.request(queryString);

    //   // logging when getting products error

    //   if (products.errors) {
    //     console.log(products.errors);
    //     return res.json({ status: 400, error: products.errors });
    //   }

    //   // 3. Embed + upsert into Pinecone
    //   const vectors = await Promise.all(
    //     products.data.products.nodes.map(async (product) => {
    //       const emb = await model.embedQuery(
    //         `${product.title}. ${product.description}. ${product.priceRangeV2.minVariantPrice.amount}`
    //       );
    //       return {
    //         id: product.id,
    //         values: emb,
    //         metadata: {
    //           title: product.title,
    //           description: product.description,
    //           price: product.priceRangeV2.minVariantPrice.amount,
    //           shop: shop,
    //           shopId: $id,
    //         },
    //       };
    //     })
    //   );

    //   await pcIndex.namespace(`__${shop}__`).upsert(vectors);

    //   // 4. Notify
    //   await database.createDocument(
    //     process.env.DATABASE_ID,
    //     process.env.APPWRITE_NOTIFICATION_COLLECTION_ID,
    //     ID.unique(),
    //     { user_id: user, message: 'You just added your shop. Good job, champ!' }
    //   );
    // }

    // // Update event
    // if (event.includes('.update')) {
    //   // Check if Twilio fields or shop_number were added
    //   if (twillio_account_siid || twillio_auth_token || shop_number) {
    //     await database.createDocument(
    //       process.env.DATABASE_ID,
    //       process.env.APPWRITE_NOTIFICATION_COLLECTION_ID,
    //       ID.unique(),
    //       {
    //         user_id: user,
    //         message: 'Congrats on adding your Twilio/Shop details 🎉',
    //       }
    //     );
    //   }
    // }

    return res.json({ ok: true }, (await response).status);
  } catch (err) {
    error(err);
    return res.json({ ok: false, error: String(err) }, 500);
  }
};

// old code

// This Appwrite function will be executed every time your function is triggered
// export default async ({ req, res, log, error }) => {
//   // You can use the Appwrite SDK to interact with other services
//   // For this example, we're using the Users service
//   const client = new Client()
//     .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
//     .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
//     .setKey(req.headers['x-appwrite-key'] ?? '');

//   const database = new Databases(client);

//   log(req.bodyText); // Raw request body, contains request data
//   log(req.bodyJson);
//   // Event metadata is NOT in body — it's in headers
//   const event = req.headers['x-appwrite-event'];
//   const eventId = req.headers['x-appwrite-event-id'];
//   const project = req.headers['x-appwrite-project'];
//   const userId = req.headers['x-appwrite-user-id']; // who triggered it
//   const timestamp = req.headers['x-appwrite-event-time'];

//   log('Headers:', req.headers);
//   log('Event:', event);

//   const {
//     shop,
//     $id,
//     user,
//     shop_number,
//     twillio_auth_token,
//     twillio_account_siid,
//   } = req.bodyJson;

//   //init shopify

//   // const { shopify, appwritesessionStorage } = await getShopify();

//   const response = await database.getDocument(
//     process.env.DATABASE_ID,
//     process.env.SESSION_COLLECTION_ID,
//     `offline_${shop}`
//   );
//   log('session:', response);

//   if (!response) {
//     return res.json({ error: 'Could not find a session' }, { status: 404 });
//   }

//   try {
//     //fecth and check if that namespace is available

//     const namespaceList = await pcIndex.listNamespaces();

//     const NAMESPACE_IS_AVAILABLE = namespaceList.namespaces.find(
//       (namespace) => namespace.name === `__${shop}__`
//     );

//     if (NAMESPACE_IS_AVAILABLE) {
//       await database.createDocument(
//         process.env.DATABASE_ID,
//         process.env.APPWRITE_NOTIFICATION_COLLECTION_ID,
//         ID.unique(),
//         {
//           user_id: user,
//           message: 'You just added a details Thank you',
//         }
//       );

//       return res.json(
//         {
//           success: true,
//         },
//         200
//       );
//     }
//     //query for getting products

//     const queryString = `query {
//             products(first: 10) {
//                 nodes {
//                     id
//                     title
//                     description
//                     priceRangeV2 {
//                       minVariantPrice {
//                         amount
//                         currencyCode
//                       }
//                       maxVariantPrice {
//                         amount
//                         currencyCode
//                       }
//                     }
//                 }
//             }
//           }`;
//     // shopify client initialization
//     const cleanDocument = {
//       id: response.$id,
//       shop: response.shop,
//       state: response.state,
//       isOnline: response.isOnline,
//       scope: response.scope,
//       accessToken: response.accessToken,
//       expires: response.expires,
//       onlineAccessInfo: response.onlineAccessInfo,
//     };

//     const session = new Session(cleanDocument);

//     const client = new shopify.clients.Graphql({ session });

//     const products = await client.request(queryString);

//     // logging when getting products error

//     if (products.errors) {
//       console.log(products.errors);
//       return res.json({ status: 400, error: products.errors });
//     }

//     // creating an embedding for the products

//     const productsEmbedingResponse = await Promise.all(
//       products.data.products.nodes.map(async (product) => {
//         try {
//           const productsEmbeding = await model.embedQuery(
//             // JSON.stringify(product)
//             `${product.title}. ${product.description}. ${product.priceRangeV2.minVariantPrice.amount}`
//           );
//           return {
//             id: product.id,
//             values: productsEmbeding,
//             metadata: {
//               title: product.title,
//               description: product.description,
//               price: product.priceRangeV2.minVariantPrice.amount,
//               shop: shop,
//               shopId: $id,
//             },
//           };
//         } catch (err) {
//           log('Embedding error:', err.message);
//           return null;
//         }
//       })
//     );

//     // Storing in pinecone index

//     await pcIndex.namespace(`__${shop}__`).upsert(productsEmbedingResponse);

//     // notify user
//     await database.createDocument(
//       process.env.DATABASE_ID,
//       process.env.APPWRITE_NOTIFICATION_COLLECTION_ID,
//       ID.unique(),
//       {
//         user_id: user,
//         message: 'You just added your shop, Goog Job, Champ',
//       }
//     );

//     return res.json(
//       {
//         success: true,
//       },
//       200
//     );
//   } catch (error) {
//     log(error);
//     return res.json(
//       {
//         success: false,
//       },
//       500
//     );
//   }
// };
