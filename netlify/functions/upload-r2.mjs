import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getUser } from "@netlify/identity";

export default async (request) => {

  if (request.method !== "POST") {
    return Response.json(
      {
        success: false,
        message: "Método não permitido"
      },
      { status: 405 }
    );
  }

  try {

    const user = await getUser();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Usuário não autenticado"
        },
        { status: 401 }
      );
    }

    if (!user.roles || !user.roles.includes("admin")) {
      return Response.json(
        {
          success: false,
          message: "Acesso negado"
        },
        { status: 403 }
      );
    }

    const data = await request.json();

    if (!data.filename || !data.contentType) {
      return Response.json(
        {
          success: false,
          message: "Nome ou tipo da imagem não informado"
        },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(data.contentType)) {
      return Response.json(
        {
          success: false,
          message: "Formato de imagem não permitido"
        },
        { status: 400 }
      );
    }

    const safeFilename =
      data.filename
        .replace(/[^a-zA-Z0-9._-]/g, "_");

    const key =
      `${Date.now()}-${safeFilename}`;

    const client =
      new S3Client({
        region: "auto",

        endpoint:
          `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,

        credentials: {
          accessKeyId:
            process.env.R2_ACCESS_KEY_ID,

          secretAccessKey:
            process.env.R2_SECRET_ACCESS_KEY
        }
      });

    const command =
      new PutObjectCommand({
        Bucket:
          process.env.R2_BUCKET_NAME,

        Key: key,

        ContentType:
          data.contentType
      });

    const uploadUrl =
      await getSignedUrl(
        client,
        command,
        {
          expiresIn: 900
        }
      );

    const publicUrl =
      `https://pub-a45f42581762449bbe1157bd6239d58f.r2.dev/${encodeURIComponent(key)}`;

    return Response.json({
      success: true,
      uploadUrl,
      publicUrl,
      key
    });

  } catch (error) {

    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Erro ao preparar upload"
      },
      { status: 500 }
    );

  }

};
