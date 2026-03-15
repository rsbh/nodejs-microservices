import { Consumer, stringDeserializer } from "@platformatic/kafka";
import { ProductEvent } from "@rsbh-nodejs-microservices/protos/product/product";

const BROKERS = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");
const CONSUMER_GROUP_ID = process.env.CONSUMER_GROUP_ID || "my-consumer-group";
const SERVICE_NAME = process.env.SERVICE_NAME || "test-consumer";
const HOSTNAME = process.env.HOSTNAME || "local";

const TOPIC = "product.created";

const consumer = new Consumer({
  groupId: CONSUMER_GROUP_ID,
  clientId: `${SERVICE_NAME}-${HOSTNAME}`,
  bootstrapBrokers: BROKERS,
  deserializers: {
    key: stringDeserializer,
    value: (value?: Buffer) => {
      return value ? ProductEvent.decode(value) : ProductEvent.create();
    },
  },
});

async function main() {
  try {
    const stream = await consumer.consume({
      topics: [TOPIC],
      mode: "committed",
    });

    for await (const message of stream) {
      console.log(
        `Received: ${message.key} ->`,
        ProductEvent.toJSON(message.value)
      );
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
