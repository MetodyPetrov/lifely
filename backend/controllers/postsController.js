const router = require('express').Router();
const { getCollection } = require('../utils/utils');
const { isAuth } = require('../middlewares/authMiddleware');
const { ObjectId } = require('mongodb');

router.use(isAuth);

router.get('/', async (req, res) => {
    try {
        const collection = await getCollection('posts');
        const posts = await collection.find().toArray();
        posts.reverse();
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:postId/comments', async (req, res) => {
    try {
        const collection = await getCollection('posts');
        const post = await collection.findOne({ _id: new ObjectId(req.params.postId) });
        
        if(!post) return res.status(404).json({ message: 'Post not found' });
        const comments = post.comments || [];
        comments.reverse();

        res.status(200).json(comments);
    } catch(error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/:postId/comments', async (req, res) => {
    try {
        const collection = await getCollection('posts');
        const post = await collection.findOne({ _id: new ObjectId(req.params.postId) });
        
        if(!post) res.status(404).json({ message: 'Post not found' });
        
        const comments = post.comments || [];
        req.body.comment && comments.push({ user: req.user.username, comment: req.body.comment, id: new ObjectId() });

        await collection.updateOne(
            { _id: new ObjectId(req.params.postId) },
            { $set: { comments: comments } }
        );
        
        res.status(200).json(comments); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

router.delete('/delete', async (req, res) => {
    try {
        const collection = await getCollection('posts');
        const postId = req.body.postId;
        const post = await collection.findOne({ _id: new ObjectId(postId) });

        if(!post) res.status(404).json({ message: 'Post not found' });
        if(post.uploadedBy !== req.user.username) throw new Error('Permission denied!');

        const result = await collection.deleteOne({ _id: new ObjectId(postId) });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Post deleted successfully' });
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.post('/create', async (req, res) => {
    try {
        const collection = await getCollection('posts');
        const currentFullDate = new Date();
        let dateSimplified = "";

        if(currentFullDate.getDate() / 10 < 1) dateSimplified = "0" + currentFullDate.getDate();
        else dateSimplified = currentFullDate.getDate();
        
        if(currentFullDate.getMonth() / 10 < 1) dateSimplified += "/0" + currentFullDate.getMonth();
        else dateSimplified += "/" + currentFullDate.getMonth();

        dateSimplified += "/" + currentFullDate.getFullYear();

        req.body.uploadedBy = req.user.username;
        req.body.date = dateSimplified;
        
        const result = await collection.insertOne(req.body);
        res.status(201).json({ message: 'Post successfully created', postId: result.insertedId });
    } catch (error) {
        console.error('Error creating post: ', error);
        res.status(500).json({ error: 'An error occurred while creating the post' });
    }
});

module.exports = router;