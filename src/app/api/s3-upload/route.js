import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

async function uploadFileToS3(file, fileName) {
  const fileBuffer = file;
  console.log(fileName);

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `myfolder/${fileName}`,
    Body: fileBuffer,
    ContentType: "image/jpg",
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  //   return fileName;
  const imageUrl = `https://s3.${process.env.AWS_S3_REGION}.amazonaws.com/${params.Bucket}/${params.Key}`;
  return imageUrl; // Return the URL of the uploaded image
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await uploadFileToS3(buffer, file.name);

    return NextResponse.json({ success: true, imageUrl }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
