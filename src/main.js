import { Client, Users } from 'node-appwrite';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  // You can use the Appwrite SDK to interact with other services
  // For this example, we're using the Users service
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  // const users = new Users(client);

  // try {
  // log(req); // Raw request body, contains request data
  log(JSON.stringify(req.bodyJson)); // Object from parsed JSON request body, otherwise string
  // log(JSON.stringify(req.headers)); // String key-value pairs of all request headers, keys are lowercase
  log(req.url); // Full URL, for example: http://awesome.appwrite.io:8000/v1/hooks?limit=12&offset=50
  log(req.host); // Hostname from the host header, such as awesome.appwrite.io
  log(req.port); // Port from the host header, for example 8000
  // pcIndex.upsert([
  //   {
  //     id: '1',
  //     values: [1, 2, 3],
  //     metadata: {
  //       name: 'bunny-bite',
  //     },
  //   },
  // ]);
  // } catch (err) {
  //   error('Could not list users: ' + err.message);
  // }

  return res.json({
    success: true,
  });
};

// // The req object contains the request data
// if (req.path === "/ping") {
//   // Use res object to respond with text(), json(), or binary()
//   // Don't forget to return a response!
//   return res.text("Pong");
// }
