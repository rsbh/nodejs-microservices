import "reflect-metadata";
import dataSource from "./db/index.js";
import { Server, ServerCredentials } from "@grpc/grpc-js";
import { getProductServer } from "./server.js";
import { ProductServiceService } from "@rsbh-nodejs-microservices/protos/product/product";
import { KafkaClient } from "./clients/kafka.client.js";

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT) || 50051;
const BROKERS = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");
const SERVICE_NAME = process.env.SERVICE_NAME || "test-producer";
const HOSTNAME = process.env.HOSTNAME || "local";

const address = `${HOST}:${PORT}`;

async function main() {
  const db = await dataSource.initialize();
  const kafkaClient = new KafkaClient({
    clientId: `${SERVICE_NAME}-${HOSTNAME}`,
    brokers: BROKERS,
  });

  const server = new Server();
  server.addService(ProductServiceService, getProductServer(db, kafkaClient));
  await new Promise<void>((resolve, reject) => {
    server.bindAsync(
      address,
      ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          return reject(error);
        }
        console.log("server is running on", port);
        server.start();
        resolve();
      }
    );
  });

  const shutdown = async () => {
    console.log("Shutting down...");
    await new Promise<void>((resolve) => {
      server.tryShutdown((err) => {
        if (err) server.forceShutdown();
        resolve();
      });
    });
    await kafkaClient.close();
    await db.destroy();
  };

  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
