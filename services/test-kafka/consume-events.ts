import { Consumer, stringDeserializers } from "@platformatic/kafka";

const BROKERS = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");
const CONSUMER_GROUP_ID = process.env.CONSUMER_GROUP_ID || "my-consumer-group";
const SERVICE_NAME = process.env.SERVICE_NAME || "test-consumer";
const HOSTNAME = process.env.HOSTNAME || "local";

const TOPIC = "product.created";

// Create a consumer with string deserialisers
const consumer = new Consumer({
  groupId: CONSUMER_GROUP_ID,
  clientId: `${SERVICE_NAME}-${HOSTNAME}`,
  bootstrapBrokers: BROKERS,
  deserializers: stringDeserializers,
});

async function main() {
  try {
    const stream = await consumer.consume({
      topics: [TOPIC],
      sessionTimeout: 10000,
      heartbeatInterval: 500,
      mode: "committed",
    });

    for await (const message of stream) {
      console.log(`Received: ${message.key} ->`, message.value);
      await message.commit();
    }
  } catch (err) {
    console.error(err);
  }
}

async function shutdown() {
  try {
    await consumer.close();
  } catch (err) {
    console.error("Error during shutdown", err);
    process.exit(1);
  }
}

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);

main();
