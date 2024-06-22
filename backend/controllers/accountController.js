const router = require('express').Router();
const bcrypt = require('bcrypt');
const { getCollection } = require('../utils/utils');

const jwt = require('jsonwebtoken');
const { isAuth } = require('../middlewares/authMiddleware');
const { SECRET } = require('../config');

router.get('/exists/:username', async (req, res) => {
    try {
        const collection = await getCollection('accounts');
        const account = await collection.findOne({ username: req.params.username });
        if(account) res.status(200).json({ exists: true });
        else res.status(200).json({ exists: false });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const collection = await getCollection('accounts');
        const account = await collection.findOne({ username: req.body.username });
        let passwordMatching = false;

        if(account) passwordMatching = await bcrypt.compare(req.body.password, account.password);

        if(passwordMatching === true) {
            const result = getAuthResults(account);
            res.status(200).json(result);
        }
        else res.status(401).json(); // error is thrown when wrong credentials are entered upon login; might change this later
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/register', async (req, res) => {
    try {
        const collection = await getCollection('accounts');

        const account = req.body;
        if(account.password === 'deleted-user') {
            res.status(200).json({ message: 'Invalid username' });
            return;
        }

        // function isPasswordStrong(password) {
        //     const minLength = 8;
        //     const hasNumber = /\d/;
        //     const hasUpperCase = /[A-Z]/;
        //     const hasLowerCase = /[a-z]/;
        //     const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

        //     return (
        //         password.length >= minLength &&
        //         hasNumber.test(password) &&
        //         hasUpperCase.test(password) &&
        //         hasLowerCase.test(password) &&
        //         hasSpecialChar.test(password)
        //     );
        // };

        // if (!isPasswordStrong(account.password)) {
        //     return res.status(200).json({
        //         message: 'Password is too weak. It must be at least 8 characters long and include numbers, uppercase and lowercase letters'/*, and special characters.'*/
        //     });
        // }

        const hashedPassword = await bcrypt.hash(account.password, 10);
        account.password = hashedPassword;
        await collection.insertOne(account);

        const result = getAuthResults(account);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', ok: false });
    }
});

router.delete('/', isAuth, async(req, res) => { 
    try {
        let collection = await getCollection('accounts');
        const account = req.user.username; 

        const accountDeletionResult = await collection.deleteOne({ username: account });
        if (accountDeletionResult.deletedCount === 1) {
            res.status(200).json({ message: 'Account deleted successfully' });
        } else {
            res.status(404).json({ message: 'Account not found' });
        }

        collection = await getCollection('posts');

        await collection.deleteMany({ uploadedBy: account });

        await collection.updateMany(
            { 'comments.user': account },
            { $set: { 'comments.$[elem].user': 'deleted-user' } },
            { arrayFilters: [{ 'elem.user': account }] }
        );
    } catch (error) {
        console.error('Error deleting account', error);
        res.status(500).json({ message: 'Internal server error'});
    }
});

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

module.exports = router;
