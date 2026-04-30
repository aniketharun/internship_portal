const { MongoClient } = require('mongodb');
require('dotenv').config();

const diagnose = async () => {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();
        console.log('Connected to:', process.env.MONGO_URI);

        const db = client.db();
        console.log('DB Name:', db.databaseName);

        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`Collection ${col.name} has ${count} docs`);
            if (col.name === 'internships') {
                const docs = await db.collection(col.name).find({}).toArray();
                console.log('Internships Data:', JSON.stringify(docs));
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
        process.exit();
    }
};

diagnose();
