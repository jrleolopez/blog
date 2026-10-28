const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true,
        trim: true
    },

    brand: {
        type: String,
        required: true,
        trim: true
    },

    model: {
        type: String,
        required: true,
        trim: true
    },

    year: {
        type: Number,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    mileage: {
        type: Number,
        required: true
    },

    city: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    image: {
        type: String,
        default: ""
    },

    imageId: {
        type: String,
        default: ""
    },

    whatsapp: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["Disponible", "Vendido"],
        default: "Disponible"
    },

    views: {
        type: Number,
        default: 0
    },

    featured: {
        type: Boolean,
        default: false
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
},
{
    timestamps: true
});

module.exports = mongoose.model("Vehicle", vehicleSchema);