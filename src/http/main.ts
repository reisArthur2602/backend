import BaileysProvider from "../infraestructure/baileys/BaileysProvider.js";

export const bootstrap = async (io: any) => {
  const baileys = new BaileysProvider("marketing");

  await baileys.init(io);

  baileys.onMessage(({ from, message }) => {
    console.log("Nova mensagem de:", from, "->", message);
  });
};
