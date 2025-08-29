import { Server } from "socket.io";
import http from "http";

interface ISetupSocket {
  server: http.Server;
}
export const setupSocket = ({ server }: ISetupSocket) => {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    socket.on("subscribe-instance", (instanceId: string) => {
      console.log(`Cliente quer acompanhar: ${instanceId}`);
    });
  });

  return io;
};
