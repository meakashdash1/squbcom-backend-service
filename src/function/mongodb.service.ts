import { Injectable } from "@nestjs/common";
import { MongoClient, Db, ObjectId } from 'mongodb';
import { MONGO_URI,DATABASE_NAME } from "utils/config";
import jwt from 'jsonwebtoken';

@Injectable()
export class mongoService{
    private db:Db;
    private client:MongoClient;
    constructor(){
        this.client=new MongoClient(MONGO_URI)
        this.connect().then(()=>{
            this.db=this.client.db(DATABASE_NAME)
        }).catch((error)=>{
            console.log(error)
        })
    }

    async connect():Promise<void>{
        try {
            await this.client.connect();
        } catch (error) {
            console.log('Error Connecting to MongoDB',error);
            throw error;
        }
    }

    async getItem(collectionName: string, id: string, dbName?: string): Promise<any> {
        try {
            const db = dbName ? this.client.db(dbName) : this.db;
            const collection = db.collection(collectionName);
            const res = await collection.findOne({ _id: new ObjectId(id) });
            return res;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getAllItem(collectionName: string, dbName?: string): Promise<any> {
        try {
            const db = dbName ? this.client.db(dbName) : this.db;
            const collection = db.collection(collectionName);
            const res = await collection.find({}).toArray();
            return res;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async createItem(collectionName: string, data: any, dbName?: string): Promise<any> {
        try {
            const db = dbName ? this.client.db(dbName) : this.db;
            const collection = db.collection(collectionName);
            const res = await collection.insertOne(data);
            return res;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async updateItem(
        collectionName: string,
        keyName: string,
        keyValue: any,
        updateValues: any,
        dbName?: string
    ): Promise<any> {
        try {
            const db = dbName ? this.client.db(dbName) : this.db;
            const filter = { [keyName]: keyValue };
            const update = { $set: updateValues };
            const collection = db.collection(collectionName);
            const res = await collection.updateOne(filter, update);
            return res;
        } catch (error) {
            throw new Error(error.message);
        }
    }


    async deleteItem(collectionName: string, keyName: string, keyValue: any, dbName?: string): Promise<any> {
        try {
            const db = dbName ? this.client.db(dbName) : this.db;
            const filter = { [keyName]: keyValue };
            const collection = db.collection(collectionName);
            const res = await collection.deleteOne(filter);
            return res;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async findByUniqueValue(collectionName: string, field: string, value: any, dbName?: string): Promise<any> {
        try {
            const db = dbName ? this.client.db(dbName) : this.db;
            const collection = db.collection(collectionName);
            const filter = { [field]: value };
            const res = await collection.findOne(filter);
            return res;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    verifyToken(token: string, secret: string): Promise<any> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });
    }

    // async findByQuery(collectionName: string, query: any, dbName?: string): Promise<any[]> {
    //     try {
    //         const db = dbName ? this.client.db(dbName) : this.db;
    //         const collection = db.collection(collectionName);

    //         // const caseInsensitiveQuery = {};
    //         // for (const field in query) {
    //         //     if (query.hasOwnProperty(field)) {
    //         //         caseInsensitiveQuery[field] = { $regex: new RegExp(`^${query[field]}$`, 'i') };
    //         //     }
    //         // }
    //         // const queryResult = await collection.find(caseInsensitiveQuery).toArray();
    //         const queryResult = await collection.aggregate(query).toArray();
    //         return queryResult;
    //     } catch (err) { console.log(err) }
    // }

    // async createDatabase(dbName: string): Promise<boolean> {
    //     const client = new MongoClient(MONGO_URI);
    //     let creation = false;
    
    //     try {
    //         await client.connect();
    
    //         // Check if the database already exists in a case-insensitive manner
    //         const existingDb = await client.db().admin().listDatabases();
    //         const dbExists = existingDb.databases.some((db) => db.name.toLowerCase() === dbName.toLowerCase());
    
    //         if (!dbExists) {
    //             const db = client.db(dbName.toUpperCase());
    //             const collectionsToCreate = Object.values(TABLE_NAMES).filter(
    //                 (collection) => collection !== TABLE_NAMES.TENANT_SETUP
    //             );
    //             await Promise.all(collectionsToCreate.map((collection) => db.createCollection(collection)));
    //             console.log(`Created database ${dbName}`);
    //             creation = true;
    //         } else {
    //             console.log(`Database ${dbName} already exists.`);
    //         }
    
    //         return creation;
    //     } catch (error) {
    //         console.error('Error creating database:', error);
    //         return creation;
    //     } finally {
    //         await client.close();
    //     }
    // }
}