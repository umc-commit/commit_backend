import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (buffer, folderName = "uploads", extension = "png") => {
  const filename = `${folderName}/${Date.now()}_${uuidv4()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: `image/${extension}`,
  });

  await s3.send(command);

  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
};

export const deleteFromS3 = async (imageUrl) => {
  try {
    // URL에서 키 추출
    const urlParts = imageUrl.split('/');
    const key = urlParts.slice(3).join('/'); // bucket-name.s3.region.amazonaws.com/ 이후 부분

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });

    await s3.send(command);
    return true;
  } catch (error) {
    console.error('S3 파일 삭제 실패:', error);
    throw error;
  }
};