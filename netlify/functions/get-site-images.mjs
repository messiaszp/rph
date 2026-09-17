import { getStore } from "@netlify/blobs";


export default async () => {

  try {

    const store =
      getStore("site-settings");


    /*
      IMAGEM PRINCIPAL — HERO
    */

    const hero =
      await store.get(
        "hero",
        {
          type: "json"
        }
      );


    /*
      IMAGEM DO SOBRE
    */

    const about =
      await store.get(
        "about",
        {
          type: "json"
        }
      );


    /*
      IMAGENS DOS SERVIÇOS
    */

    const esportes =
      await store.get(
        "service-esportes",
        {
          type: "json"
        }
      );


    const eventos =
      await store.get(
        "service-eventos",
        {
          type: "json"
        }
      );


    const retratos =
      await store.get(
        "service-retratos",
        {
          type: "json"
        }
      );


    /*
      RETORNA TODAS AS IMAGENS
    */

    return Response.json({

      success:
        true,

      hero:
        hero || null,

      about:
        about || null,

      services: {

        esportes:
          esportes || null,

        eventos:
          eventos || null,

        retratos:
          retratos || null

      }

    });


  } catch (error) {

    console.error(
      "Erro ao carregar imagens do site:",
      error
    );


    return Response.json(

      {
        success:
          false,

        message:
          "Erro ao carregar imagens do site"
      },

      {
        status:
          500
      }

    );

  }

};
