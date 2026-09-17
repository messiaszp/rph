
import { getStore } from "@netlify/blobs";
import {
  S3Client,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";
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

    /*
      VERIFICAR USUÁRIO
    */

    const user =
      await getUser();


    if (!user) {

      return Response.json(
        {
          success: false,
          message: "Usuário não autenticado"
        },
        { status: 401 }
      );

    }


    /*
      VERIFICAR ADMIN
    */

    if (
      !user.roles ||
      !user.roles.includes("admin")
    ) {

      return Response.json(
        {
          success: false,
          message: "Acesso negado"
        },
        { status: 403 }
      );

    }


    /*
      RECEBER DADOS
    */

    const data =
      await request.json();


    /*
      PERMITIR SOMENTE
      HERO OU ABOUT
    */

    const allowedSlots = [
  "hero",
  "about",
  "service-esportes",
  "service-eventos",
  "service-retratos"
];


if (
  !allowedSlots.includes(data.slot)
) {

  return Response.json(
    {
      success: false,
      message: "Local da imagem inválido"
    },
    { status: 400 }
  );

}

    /*
      VERIFICAR DADOS DA IMAGEM
    */

    if (
      !data.publicUrl ||
      !data.key ||
      !data.filename
    ) {

      return Response.json(
        {
          success: false,
          message: "Dados da imagem incompletos"
        },
        { status: 400 }
      );

    }


    /*
      NETLIFY BLOBS

      Cada imagem fica salva
      em seu próprio slot:

      hero
      about
    */

    const store =
      getStore("site-settings");


    /*
      PEGAR IMAGEM ANTERIOR
    */

    const previous =
      await store.get(
        data.slot,
        {
          type: "json"
        }
      );


    /*
      NOVOS DADOS
    */

    const imageData = {

      slot:
        data.slot,

      image:
        data.publicUrl,

      key:
        data.key,

      filename:
        data.filename,

      updatedAt:
        new Date().toISOString()

    };


    /*
      SALVAR NO NETLIFY BLOBS
    */

    await store.setJSON(
      data.slot,
      imageData
    );


    /*
      REMOVER IMAGEM ANTIGA DO R2

      Só remove se realmente
      existir uma imagem anterior
      e ela for diferente da nova.
    */

    if (
      previous &&
      previous.key &&
      previous.key !== data.key
    ) {

      const client =
        new S3Client({

          region:
            "auto",

          endpoint:
            `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,

          credentials: {

            accessKeyId:
              process.env.R2_ACCESS_KEY_ID,

            secretAccessKey:
              process.env.R2_SECRET_ACCESS_KEY

          }

        });


      try {

        await client.send(

          new DeleteObjectCommand({

            Bucket:
              process.env.R2_BUCKET_NAME,

            Key:
              previous.key

          })

        );

      } catch (deleteError) {

        console.error(
          "Erro ao remover imagem antiga do R2:",
          deleteError
        );

      }

    }


    /*
      RESPOSTA
    */

    return Response.json({

      success:
        true,

      image:
        imageData

    });


  } catch (error) {

    console.error(error);


    return Response.json(
      {
        success: false,
        message:
          "Erro ao salvar imagem do site"
      },
      { status: 500 }
    );

  }

};
