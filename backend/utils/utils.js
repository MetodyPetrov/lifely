const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function getCollection(type) {
    try {
        const db = client.db('Lifely');
        const collection = db.collection(type);
        return collection;
    } catch (err) {
        throw new Error(`Error accessing ${type} collection: ` + err.message);
    }
}

module.exports = { getCollection };