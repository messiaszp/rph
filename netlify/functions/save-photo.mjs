import { getStore } from "@netlify/blobs";

export default async (request) => {
  if (request.method !== "POST") {
    return Response.json(
      { success: false, message: "Método não permitido" },
      { status: 405 }
    );
  }

  try {
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
