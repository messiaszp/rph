import { getStore } from "@netlify/blobs";

export default async () => {

  try {

    const store =
      getStore("gallery");

    const { blobs } =
      await store.list();

    const photos =
      await Promise.all(
        blobs.map(async (blob) => {

          return await store.get(
            blob.key,
            {
              type: "json"
            }
          );

        })
      );

    return Response.json({
      success: true,
      photos
    });

  } catch (error) {

    console.error(error);

    return Response.json(
      {
        success: false,
        message:
          "Erro ao listar fotografias"
      },
      { status: 500 }
    );

  }

};
