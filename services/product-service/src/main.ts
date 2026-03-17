import "reflect-metadata";
import dataSource from "./db/index.js";
import { Server, ServerCredentials } from "@grpc/grpc-js";
import { getProductServer } from "./server.js";
import { ProductServiceService } from "@rsbh-nodejs-microservices/protos/product/product";
import { KafkaClient } from "./clients/kafka.client.js";

const server = new Server();

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT) || 50051;
const BROKERS = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");
const SERVICE_NAME = process.env.SERVICE_NAME || "test-producer";
const HOSTNAME = process.env.HOSTNAME || "local";

const address = `${HOST}:${PORT}`;

dataSource
  .initialize()
  .then(async (db) => {
    const kafkaClient = new KafkaClient({
      clientId: `${SERVICE_NAME}-${HOSTNAME}`,
      brokers: BROKERS,
    });
    server.addService(ProductServiceService, getProductServer(db, kafkaClient));
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
