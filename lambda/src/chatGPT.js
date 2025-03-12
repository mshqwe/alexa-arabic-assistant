const { Configuration, OpenAIApi } = require('openai');
const config = require('./config');

class ChatGPTClient {
  constructor() {
    // تهيئة مكتبة OpenAI
    this.configuration = new Configuration({
      apiKey: config.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(this.configuration);
    
    // تعريف سياق المحادثة الأولي
    this.defaultSystemPrompt = `أنت مساعد لغوي ذكي باللغة العربية. يرجى:
    1. الإجابة باللغة العربية الفصحى السلسة
    2. تقديم إجابات مفيدة ومختصرة تناسب المحادثة الصوتية
    3. استخدام لغة ودية ومهذبة
    4. تجنب الإجابات الطويلة جداً
    5. الإشارة بوضوح عندما لا تعرف الإجابة`;
    
    this.conversationHistory = [];
  }

  async getResponse(userQuery) {
    try {
      // إضافة سؤال المستخدم إلى سجل المحادثة
      this.addToConversationHistory('user', userQuery);
      
      // إنشاء قائمة الرسائل التي سيتم إرسالها إلى OpenAI
      const messages = [
        { role: 'system', content: this.defaultSystemPrompt },
        ...this.conversationHistory.slice(-10) // الاحتفاظ بآخر 10 رسائل فقط
      ];
      
      // إرسال الطلب إلى OpenAI API
      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 150,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      });
      
      // استخراج الرد
      const responseText = response.data.choices[0].message.content;
      
      // إضافة رد المساعد إلى سجل المحادثة
      this.addToConversationHistory('assistant', responseText);
      
      return responseText;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return 'عذراً، حدث خطأ أثناء معالجة طلبك. حاول مرة أخرى لاحقاً.';
    }
  }

  addToConversationHistory(role, content) {
    this.conversationHistory.push({
      role: role,
      content: content
    });
    
    // الحفاظ على حجم معقول لسجل المحادثة (اختياري)
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  clearConversationHistory() {
    this.conversationHistory = [];
  }
}

exports.chatGPTClient = new ChatGPTClient();
