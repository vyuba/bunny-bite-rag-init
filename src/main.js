import { Client, Users } from 'node-appwrite';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  // You can use the Appwrite SDK to interact with other services
  // For this example, we're using the Users service
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const users = new Users(client);

  try {
    console.log(req.bodyJson);
    // pcIndex.upsert([
    //   {
    //     id: '1',
    //     values: [1, 2, 3],
    //     metadata: {
    //       name: 'bunny-bite',
    //     },
    //   },
    // ]);
  } catch (err) {
    error('Could not list users: ' + err.message);
  }

  return res.json({
    success: true,
  });
};
