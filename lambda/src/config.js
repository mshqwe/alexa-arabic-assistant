require('dotenv').config();

module.exports = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AWS_REGION: 'us-east-1',
    DEFAULT_LANGUAGE: 'ar-SA',
    TRANSCRIBE_CONFIG: {
        language: 'ar-SA',
        sampleRate: 16000
    },
    S3_CONFIG: {
        bucketName: 'alexa-audio-transcribe',
        region: 'us-east-1'
    }
};