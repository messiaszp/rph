import { getStore } from "@netlify/blobs";
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

    // Verificar autenticação
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

    // Verificar role de administrador
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

    const photo = await store.get(data.id, {
      type: "json"
    });

    if (!photo) {
      return Response.json(
        {
          success: false,
          message: "Foto não encontrada"
        },
        { status: 404 }
      );
    }

    photo.category = data.category || photo.category;
photo.size = data.size || photo.size || "lg";

if (typeof data.published === "boolean") {
  photo.published = data.published;
}

photo.alt = `Foto de ${photo.category}`;

    await store.setJSON(data.id, photo);

    return Response.json({
      success: true,
      photo
    });

  } catch (error) {

    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Erro ao atualizar fotografia"
      },
      { status: 500 }
    );

  }

};
