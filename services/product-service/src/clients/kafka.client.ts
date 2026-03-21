import { Producer, ProduceAcks, stringSerializer } from "@platformatic/kafka";

interface kafkaConfig {
  brokers: string[];
  clientId: string;
}

export class KafkaClient {
  private readonly producer: Producer<string, Buffer, Buffer, Buffer>;

  constructor(config: kafkaConfig) {
    this.producer = new Producer({
      clientId: config.clientId,
      bootstrapBrokers: config.brokers,
      serializers: {
        key: stringSerializer,
      },
      acks: ProduceAcks.ALL,
    });
  }

  public async publishEvent(topic: string, key: string, value: Buffer) {
    try {
      const { offsets } = await this.producer.send({
        messages: [{ topic, key, value }],
      });
      offsets?.forEach(({ topic, partition, offset }) => {
        console.log(
          `Published to ${topic} partition ${partition} at offset ${offset}`
        );
      });
    } catch (err) {
      console.error("Unable to publish event", err);
      throw err;
    }
  }

  public async close() {
    return this.producer.close();
  }
}
