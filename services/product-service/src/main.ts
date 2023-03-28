import "reflect-metadata";
import dataSource from "./db";
import { Server, ServerCredentials } from "@grpc/grpc-js";

const server = new Server();

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT) || 50051;

const address = `${HOST}:${PORT}`;

dataSource
  .initialize()
  .then(() => {
    server.bindAsync(
      address,
      ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          throw error;
        }
        console.log("server is running on", port);
        server.start();
      }
    );
  })
  .catch((error) => console.log(error));
