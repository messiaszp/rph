
import { getStore } from "@netlify/blobs";


export default async () => {

  try {

    /*
      Acessa o armazenamento
      onde ficam as configurações
      das imagens do site.
    */

    const store =
      getStore("site-settings");


    /*
      Busca as duas imagens:

      hero  = foto principal
      about = foto do Sobre
    */

    const hero =
      await store.get(
        "hero",
        {
          type: "json"
        }
      );


    const about =
      await store.get(
        "about",
        {
          type: "json"
        }
      );


    /*
      Retorna as imagens.
    */

    return Response.json({

      success:
        true,

      hero:
        hero || null,

      about:
        about || null

    });


  } catch (error) {

    console.error(
      "Erro ao carregar imagens do site:",
      error
    );


    return Response.json(
      {
        success: false,
        message:
          "Erro ao carregar imagens do site"
      },
      { status: 500 }
    );

  }

};

