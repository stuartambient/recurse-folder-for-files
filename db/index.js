/* import * as dotenv from 'dotenv'; */
import { MongoClient } from 'mongodb';
import { uri } from '../hidden/env.js';

const client = new MongoClient(uri);

const results = y => console.log('file: ', y);

async function run() {
  try {
    await client.connect();
    const database = client.db('library');
    const music = database.collection('music');
    const query = { name: { $regex: 'carceri' } };

    const options = { sort: { name: 1 }, projection: { _id: 0, name: 1 } };
    const results = await music.countDocuments(query);
    if (results === 0) {
      console.dir('No documents found!');
    }
    const cursor = music.find(query, options);
    await cursor.forEach(p => results(p));
  } finally {
    await client.close();
  }
}

/* run(); */

export default client;
