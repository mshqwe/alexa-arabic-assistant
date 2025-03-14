# المساعد الذكي - مهارة أليكسا بالعربية

مهارة ذكية تستخدم ChatGPT للإجابة على الأسئلة باللغة العربية.

## المميزات
- دعم كامل للغة العربية
- تكامل مع ChatGPT
- تحويل الصوت إلى نص باستخدام Amazon Transcribe

## المتطلبات
- حساب Amazon Developer
- مفتاح API من OpenAI
- Node.js v14+

## التثبيت
1. نسخ المشروع:
```bash
git clone https://github.com/mshqwe/alexa-arabic-assistant.git
cd alexa-arabic-assistant
```

2. تثبيت التبعيات:
```bash
cd lambda
npm install
```

3. إعداد المتغيرات البيئية:
انسخ ملف `.env.example` إلى `.env` وأضف مفتاح OpenAI API الخاص بك.

## هيكل المشروع
```
alexa-arabic-assistant/
├── .ask/
│   └── config
├── lambda/
│   ├── src/
│   │   ├── chatGPT.js
│   │   ├── config.js
│   │   ├── setup.js
│   │   └── speechToText.js
│   ├── index.js
│   ├── package.json
│   └── .env
├── skill-package/
│   ├── interactionModels/
│   │   └── custom/
│   │       └── ar-SA.json
│   └── skill.json
├── .gitignore
└── README.md
```

## الترخيص
MIT
#   a l e x a - a r a b i c - a s s i s t a n t 
 
 