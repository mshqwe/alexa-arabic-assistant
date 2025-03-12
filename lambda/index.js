const Alexa = require('ask-sdk-core');
const { speechClient } = require('./src/speechToText');
const { chatGPTClient } = require('./src/chatGPT');
const setupManager = require('./src/setup');

// إضافة دالة للإعداد الأولي
const initializeSkill = async () => {
  try {
    await setupManager.setupS3Bucket();
    await setupManager.setupIAMPermissions();
    console.log('Skill setup completed successfully');
  } catch (error) {
    console.error('Error during skill setup:', error);
  }
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = 'مرحباً بك! يمكنك سؤالي أي شيء عن طريق قول "اسأل المساعد" متبوعاً بسؤالك';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const AudioChatIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AudioChatIntent';
  },
  async handle(handlerInput) {
    try {
      const audioData = Alexa.getSlotValue(handlerInput.requestEnvelope, 'audioData');
      if (!audioData) {
        throw new Error('No audio data provided');
      }

      // تحويل الصوت إلى نص باستخدام Amazon Transcribe
      const transcription = await speechClient.transcribeAudio(audioData);
      
      // الحصول على رد من ChatGPT
      const response = await chatGPTClient.getResponse(transcription);

      return handlerInput.responseBuilder
        .speak(response)
        .reprompt('هل تريد أن تسأل شيئاً آخر؟')
        .getResponse();
    } catch (error) {
      console.error('Error:', error);
      return handlerInput.responseBuilder
        .speak('عذراً، حدث خطأ في معالجة طلبك. حاول مرة أخرى')
        .getResponse();
    }
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'يمكنك بدء المحادثة بقول "اسأل المساعد" متبوعاً بسؤالك';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = 'مع السلامة';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

// معالج للنية الافتراضية عندما لا تتعرف أليكسا على ما يقوله المستخدم
const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'عذراً، لم أفهم ما تريد. يمكنك قول "مساعدة" للحصول على معلومات حول كيفية استخدامي.';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    // أي عمليات تنظيف ضرورية
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error('Error handled:', error);
    const speakOutput = 'عذراً، حدث خطأ ما. الرجاء المحاولة مرة أخرى';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    AudioChatIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .withCustomUserAgent('alexa-skill/arabic-assistant/1.0.0')
  .withPersistenceAdapter(
    new Alexa.DynamoDbPersistenceAdapter({
      tableName: 'alexa-arabic-assistant-table',
      createTable: true
    })
  )
  .lambda();

// تشغيل الإعداد عند بدء Lambda
initializeSkill();
