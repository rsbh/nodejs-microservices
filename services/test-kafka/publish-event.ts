import { Producer, ProduceAcks, stringSerializer } from "@platformatic/kafka";
import { v4 as uuid } from "uuid";
import {
  Product,
  ProductEvent,
  ProductEventType,
} from "@rsbh-nodejs-microservices/protos/product/product";

const BROKERS = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");
const SERVICE_NAME = process.env.SERVICE_NAME || "test-producer";
const HOSTNAME = process.env.HOSTNAME || "local";

const TOPIC = "product.created";

const producer = new Producer({
  clientId: `${SERVICE_NAME}-${HOSTNAME}`,
  bootstrapBrokers: BROKERS,
  serializers: {
    key: stringSerializer,
    value: (value?: ProductEvent) => {
      const event = value ?? ProductEvent.create();
      return Buffer.from(ProductEvent.encode(event).finish());
    },
  },
  acks: ProduceAcks.ALL,
});

async function main() {
  const product = Product.create({
    id: Math.random() * 1000,
    name: "Test Product",
  });

  const event = ProductEvent.create({
    id: uuid(),
    type: ProductEventType.PRODUCT_EVENT_TYPE_CREATED,
    product: product,
    timestamp: new Date(),
  });

  try {
    const { offsets } = await producer.send({
      messages: [
        {
          topic: TOPIC,
          key: event.id,
          value: event,
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
