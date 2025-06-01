const canvas = require('canvas');
const faceapi = require('face-api.js');
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Load the models
async function loadModels() {
    const MODEL_URL = './models';
    await Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL)
    ]);
}

// Convert base64 to buffer
function base64ToBuffer(base64) {
    return Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
}

// Get face descriptor from image
async function getFaceDescriptor(imageBuffer) {
    // Load image
    const img = await canvas.loadImage(imageBuffer);

    // Resize image to 256x256 to match model requirements
    const resizedCanvas = canvas.createCanvas(256, 256);
    const ctx = resizedCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 256, 256);

    // Get image data and convert RGBA to RGB, channel-first
    const imageData = ctx.getImageData(0, 0, 256, 256);
    const { data } = imageData; // Uint8ClampedArray of length 256*256*4
    // Convert RGBA [H,W,4] to RGB [3,H,W]
    const rgb = [[], [], []];
    for (let i = 0; i < data.length; i += 4) {
        rgb[0].push(data[i]);     // R
        rgb[1].push(data[i + 1]); // G
        rgb[2].push(data[i + 2]); // B
    }
    // This is [3, 256*256]
    // Flatten to [3,256,256] if needed (for raw tensor use)
    // Debug log
    console.log('RGB channel lengths:', rgb[0].length, rgb[1].length, rgb[2].length); // should be 65536 each
    console.log('Total RGB values:', rgb[0].length + rgb[1].length + rgb[2].length); // should be 196608
    // If you ever need a tensor:
    const tf = require('@tensorflow/tfjs-node');
    const input = tf.tensor(rgb, [3, 256, 256], 'int32');
    console.log('Tensor shape:', input.shape);

    // For face-api.js, use the resizedCanvas directly:
    const detections = await faceapi.detectSingleFace(resizedCanvas)
        .withFaceLandmarks()
        .withFaceDescriptor();
    
    if (!detections) {
        throw new Error('No face detected in the image');
    }
    
    return detections.descriptor;
}

// Compare two face descriptors
function compareFaces(descriptor1, descriptor2) {
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
    // The threshold of 0.6 is recommended by face-api.js
    return distance < 0.6;
}

module.exports = {
    loadModels,
    base64ToBuffer,
    getFaceDescriptor,
    compareFaces
};
