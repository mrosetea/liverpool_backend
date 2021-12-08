const mongoose = require('mongoose');

const Image = mongoose.model('Image', {
    contentType: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
});

module.exports = Image;
