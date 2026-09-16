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

    // Dados enviados pelo painel
    const data = await request.json();

    const store = getStore("gallery");

    const id = data.id || Date.now().toString();

    const photo = {
      id,
      image: data.image,
      filename: data.filename || "",
      category: data.category || "eventos",
      size: data.size || "",
      alt: data.alt || "Fotografia"
      published: true
    };

    await store.setJSON(id, photo);

    return Response.json({
      success: true,
      photo
    });

  } catch (error) {

    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Erro ao salvar fotografia"
      },
      { status: 500 }
    );

  }

};
