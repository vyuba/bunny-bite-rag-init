import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export const pcIndex = pc.index('bunny-bite-index');

// pcIndex.upsert([
//   {
//     id: "1",
//     values: [1, 2, 3],
//     metadata: {
//       name: "bunny-bite",
//     },
//   },
// ]);
