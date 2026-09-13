import { getStore } from "@netlify/blobs";

export default async () => {

  const store = getStore("gallery");

  await store.setJSON("test", {
    id: "test",
    message: "Netlify Blobs funcionando!",
    image: "https://res.cloudinary.com/fu66mxxo/image/upload/v1789317517/pc.jpg"
  });

  const data = await store.get("test", {
    type: "json"
  });

  return Response.json({
    success: true,
    data
  });
};
