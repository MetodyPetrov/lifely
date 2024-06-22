const { getCollection } = require('./utils/utils');
const { auth } = require('./middlewares/authMiddleware');
const routes = require('./routes');

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

const app = express();
const WebSocket = require('ws');
const port = 5000;

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const { SECRET } = require('./config');

app.use(cors());
app.use(express.json());

app.use(auth);
app.use(routes);

const { ObjectId } = require('mongodb'); 

let userConnections = new Map(); 

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (err) {
        throw new Error('Error connecting to MongoDB: ' + err.message);
    }
}

connectToMongoDB(); 

function getAuthResults(user) {
    const payload = {
        _id: user._id,
        username: user.username
    };
    
    const token = jwt.sign(payload, SECRET, { expiresIn: '6h' });

    const result = {
        _id: user._id,
        username: user.username,
        accessToken: token
    };

    return result;
}

app.delete('/comments/delete/:postId', async (req, res) => {
    try {
        const collection = await getCollection('posts');
        const post = await collection.findOne({ _id: new ObjectId(req.params.postId) });

        let owner = post.uploadedBy === req.user.username;

        const commentOwner = req.user.username;
        const commentContent = req.body.comment;

        const commentUpdate = owner ? { comment: commentContent, id: new ObjectId(req.body.id) } : { user: commentOwner, comment: commentContent, id: new ObjectId(req.body.id) };
        
        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.postId) },
            {
                $pull: {
                    comments: commentUpdate
                }
            }
        );
        
        if (result.modifiedCount === 1) {
            res.status(200).json({ message: 'Comment deleted successfully.' });
        } else {
            res.status(404).json({ message: 'Comment not found.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the comment.' });
    }
});

app.put('/comments/edit/:postId', async (req, res) => {
    try {
        const collection = await getCollection('posts');
        
        const commentOwner = req.user.username;

        const newComment = req.body.newComment;
        const prevComment = req.body.prevComment;
        
        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.postId) },
            {
                $set: { 'comments.$[elem].comment': newComment }
            },
            {
                arrayFilters: [{ 'elem.comment': prevComment, 'elem.user': commentOwner, 'elem.id': new ObjectId(req.body.id) }],
            }
        );


        if(result.modifiedCount === 1) {
            res.status(200).json({ message: 'Comment edited successfully.' });
        } else {
            res.status(404).json({ message: 'Comment not found.' });
        }
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating the comment.' });
    }
});

app.put('/username-change', async (req, res) => { 
    try {
        const collection = await getCollection('posts');
        const oldUsername = req.user.username;
        const newUsername = req.body.username;
        
        await collection.updateMany(
            { uploadedBy: oldUsername },
            { $set: { uploadedBy: newUsername } }
        );
        
        await collection.updateMany(
            { 'comments.user': oldUsername },
            { $set: { 'comments.$[elem].user': newUsername } },
            { arrayFilters: [{ 'elem.user': oldUsername }] }
        );

        const ws = userConnections.get(oldUsername);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send('Changing user authentication info...');
        }

        const accountsCollection = await getCollection('accounts');
        
        const result = await accountsCollection.updateOne(
            { username: oldUsername },
            { $set: { username: newUsername } }
        );
        
        if (result.modifiedCount === 0) {
            throw new Error('Could not modify account.');
        }

        const newToken = getAuthResults({
            _id: req.user._id,
            username: newUsername,
            password: req.user.password
        });

        res.status(200).json({ message: 'Username change successful', tkn: newToken.accessToken });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

const server = app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    const token = req.url.split('?token=')[1];
    if (token) {
        jwt.verify(token, SECRET, (err, user) => {
            if (err) return ws.close();
            userConnections.set(user.username, ws);

            ws.on('close', () => {
                userConnections.delete(user.username);
            });
        });
    } else {
        ws.close();
    }
});