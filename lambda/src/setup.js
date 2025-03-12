const { S3Client, CreateBucketCommand, PutBucketCorsCommand } = require("@aws-sdk/client-s3");
const { IAMClient, PutRolePolicyCommand } = require("@aws-sdk/client-iam");
const config = require('./config');

class SetupManager {
  constructor() {
    this.s3Client = new S3Client({ region: config.AWS_REGION });
    this.iamClient = new IAMClient({ region: config.AWS_REGION });
  }

  async setupS3Bucket() {
    try {
      await this.s3Client.send(new CreateBucketCommand({
        Bucket: config.S3_CONFIG.bucketName
      }));
      console.log('S3 Bucket created successfully');
    } catch (error) {
      if (error.name !== 'BucketAlreadyExists') {
        throw error;
      }
    }
  }

  async setupIAMPermissions() {
    const policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: [
            "s3:PutObject",
            "s3:GetObject",
            "transcribe:StartTranscriptionJob",
            "transcribe:GetTranscriptionJob",
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
            "logs:StartLiveTail",
            "logs:GetLogEvents",
            "logs:FilterLogEvents"
          ],
          Resource: [
            `arn:aws:s3:::${config.S3_CONFIG.bucketName}/*`,
            "arn:aws:transcribe:*:*:*",
            "arn:aws:logs:*:*:*"
          ]
        }
      ]
    };

    try {
      await this.configureIAMPolicy(policyDocument);
      console.log('IAM permissions configured successfully');
    } catch (error) {
      console.error('Error configuring IAM permissions:', error);
      throw error;
    }
  }
}

module.exports = new SetupManager();