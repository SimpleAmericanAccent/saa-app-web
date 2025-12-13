import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const getSignedUrlForDownload = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });
  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 60 * 60, // 1 hour
  });
  return signedUrl;
};

export const getSignedUrlForUpload = async (key, contentType = null) => {
  // Use S3 PUT credentials if available, otherwise fall back to regular credentials
  const putAccessKeyId =
    process.env.AWS_ACCESS_KEY_ID_S3_PUT_OBJECT ||
    process.env.AWS_ACCESS_KEY_ID;
  const putSecretAccessKey =
    process.env.AWS_SECRET_ACCESS_KEY_S3_PUT_OBJECT ||
    process.env.AWS_SECRET_ACCESS_KEY;

  const uploadS3Client =
    putAccessKeyId !== process.env.AWS_ACCESS_KEY_ID
      ? new S3Client({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: putAccessKeyId,
            secretAccessKey: putSecretAccessKey,
          },
        })
      : s3Client;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    ...(contentType && { ContentType: contentType }),
  });
  const signedUrl = await getSignedUrl(uploadS3Client, command, {
    expiresIn: 60 * 1, // 1 minute
  });
  return signedUrl;
};
