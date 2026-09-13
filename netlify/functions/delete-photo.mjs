import { getStore } from "@netlify/blobs";

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

    const data = await request.json();

    if (!data.id) {
      return Response.json(
        {
          success: false,
          message: "ID da foto não informado"
        },
        { status: 400 }
      );
    }

    const store = getStore("gallery");

    await store.delete(data.id);

    return Response.json({
      success: true,
      message: "Foto removida com sucesso"
    });

  } catch (error) {

    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Erro ao remover fotografia"
      },
      { status: 500 }
    );
  }
};
