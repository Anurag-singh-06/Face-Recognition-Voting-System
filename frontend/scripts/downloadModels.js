const fs = require('fs');
const https = require('https');
const path = require('path');

const modelsDir = path.join(__dirname, '../public/models');

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

const models = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
];

const baseUrl = 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/';

models.forEach(model => {
    const file = fs.createWriteStream(path.join(modelsDir, model));
    https.get(baseUrl + model, response => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${model}`);
        });
    }).on('error', err => {
        fs.unlink(path.join(modelsDir, model));
        console.error(`Error downloading ${model}:`, err.message);
    });
});
