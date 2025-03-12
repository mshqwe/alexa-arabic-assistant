const { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const config = require('./config');

class SpeechToTextClient {
  constructor() {
    this.transcribeClient = new TranscribeClient({ region: config.AWS_REGION });
    this.s3Client = new S3Client({ region: config.AWS_REGION });
  }

  async transcribeAudio(audioData) {
    try {
      // تحويل الصوت من Base64 إلى Buffer
      const audioBuffer = Buffer.from(audioData, 'base64');

      // رفع الملف الصوتي إلى S3
      const bucketName = 'alexa-audio-transcribe';
      const key = `audio-${Date.now()}.wav`;
      
      await this.s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: audioBuffer
      }));

      // بدء عملية التحويل
      const transcribeParams = {
        TranscriptionJobName: `Job-${Date.now()}`,
        LanguageCode: 'ar-SA',
        Media: {
          MediaFileUri: `s3://${bucketName}/${key}`
        },
        MediaFormat: 'wav',
        Settings: {
          ShowSpeakerLabels: false,
          MaxSpeakerLabels: 1,
          VocabularyName: "ArabicCustom",
          LanguageModelName: "ArabicGeneral",
          ShowAlternatives: true,
          MaxAlternatives: 2
        }
      };

      const transcribeResponse = await this.transcribeClient.send(
        new StartTranscriptionJobCommand(transcribeParams)
      );

      // انتظار اكتمال التحويل والحصول على النتيجة
      const transcription = await this.waitForTranscription(transcribeResponse.TranscriptionJob.TranscriptionJobName);
      return transcription;

    } catch (error) {
      console.error('Transcribe Error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  async waitForTranscription(jobName) {
    // انتظار حتى اكتمال التحويل
    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const { TranscriptionJob } = await this.transcribeClient.send(
        new GetTranscriptionJobCommand({ TranscriptionJobName: jobName })
      );

      if (TranscriptionJob.TranscriptionJobStatus === 'COMPLETED') {
        return TranscriptionJob.Transcript.TranscriptFileUri;
      } else if (TranscriptionJob.TranscriptionJobStatus === 'FAILED') {
        throw new Error('Transcription job failed');
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Transcription timeout');
  }
}

exports.speechClient = new SpeechToTextClient();