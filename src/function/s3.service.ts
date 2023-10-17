import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY } from 'utils/config';

interface ExpressMulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: AWS_REGION, 
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(file: any, bucketName: string, folderName: string, key: string): Promise<string> {
    const fullPath = `${folderName}/${key}`;
    const uploadParams = {
      Bucket: bucketName,
      Key: fullPath,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read' as ObjectCannedACL,
    };

    const command = new PutObjectCommand(uploadParams);

    try {
      await this.s3Client.send(command);
      const fileUrl = `https://${bucketName}.s3.amazonaws.com/${fullPath}`;
      return fileUrl;
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }
}