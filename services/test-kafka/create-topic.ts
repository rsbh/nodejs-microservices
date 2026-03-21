import { Admin } from "@platformatic/kafka";

const BROKERS = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");
const SERVICE_NAME = process.env.SERVICE_NAME || "test-kafka-admin";
const HOSTNAME = process.env.HOSTNAME || "local";

const TOPICS = ["product.created", "product.updated"];

const admin = new Admin({
  clientId: `${SERVICE_NAME}-${HOSTNAME}`,
  bootstrapBrokers: BROKERS,
});

async function main() {
  try {
    await admin.createTopics({
      topics: TOPICS,
      partitions: 3,
      replicas: 1,
    });
    console.log("Topics created successfully");
  } catch (err: unknown) {
    console.error(err);
  } finally {
    await admin.close();
  }
}

main();
