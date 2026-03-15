import { Producer, ProduceAcks, stringSerializers } from "@platformatic/kafka";
import { v4 as uuid } from "uuid";

const BROKERS = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");
const SERVICE_NAME = process.env.SERVICE_NAME || "test-producer";
const HOSTNAME = process.env.HOSTNAME || "local";

const TOPIC = "product.created";

const producer = new Producer({
  clientId: `${SERVICE_NAME}-${HOSTNAME}`,
  bootstrapBrokers: BROKERS,
  serializers: stringSerializers,
  acks: ProduceAcks.ALL,
});

async function main() {
  const product = {
    id: uuid(),
    name: "Test",
  };
  try {
    const { offsets } = await producer.send({
      messages: [
        {
          topic: TOPIC,
          key: product.id,
          value: JSON.stringify(product),
        },
      ],
    });

    offsets?.forEach(({ topic, partition, offset }) => {
      console.log(
        `Published to ${topic} partition ${partition} at offset ${offset}`
      );
    });
  } catch (err) {
    console.error(err);
  } finally {
    await producer.close();
  }
}

main();
