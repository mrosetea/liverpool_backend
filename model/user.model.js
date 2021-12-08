const mongoose = require("mongoose");
const { Types, Schema } = require('mongoose');
const Product = require('./product.model');

const User = mongoose.model('User', {
    name: String,
    lastName: String,
    username: String,
    password: String,
    bag: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    shoppingHistory: [Types.ObjectId],
    rol: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
});

module.exports = User;
