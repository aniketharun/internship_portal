const { MongoClient } = require('mongodb');
require('dotenv').config();

const findEverywhere = async () => {
    const client = new MongoClient('mongodb://127.0.0.1:27017');
    try {
        await client.connect();
        const admin = client.db().admin();
        const dbs = await admin.listDatabases();

        for (const dbInfo of dbs.databases) {
            const dbName = dbInfo.name;
            if (['admin', 'local', 'config'].includes(dbName)) continue;

            const db = client.db(dbName);
            const collections = await db.listCollections().toArray();

            for (const colInfo of collections) {
                const colName = colInfo.name;
                const docs = await db.collection(colName).find({ title: /Software Engineering/i }).toArray();
                if (docs.length > 0) {
                    console.log(`FOUND in DB: ${dbName}, Collection: ${colName}`);
                    docs.forEach(d => console.log(`  ID: ${d._id}, Stipend: ${d.stipend}, Deadline: ${d.deadline}`));
                }
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
        process.exit();
    }
};

findEverywhere();
