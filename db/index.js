import { MongoClient } from 'mongodb';
import pw from '../hidden/hidden.js';
/* dotenv.config(); */

const uri = pw;

console.log(uri);

/* const client = new MongoClient(url);

const results = y => console.log('file: ', y);

async function run() {
  try {
    await client.connect();
    const database = client.db('library');
    const music = database.collection('music');
    const query = { name: { $regex: 'carceri' } }; */
/* OR
collection.find({ runtime: { $lt: 15 } }, { sort: { title: 1 }, projection: { _id: 0, title: 1, imdb: 1 }});
collection.find({ runtime: { $lt: 15 } }).sort({ title: 1}).project({ _id: 0, title: 1, imdb: 1 });
    */
/* const options = { sort: { name: 1 }, projection: { _id: 0, name: 1 } };
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
run();
 */
