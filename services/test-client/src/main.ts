import { credentials } from "@grpc/grpc-js";
import {
  CreateProductRequest,
  ProductServiceClient,
} from "@nodejs-microservices/protos/dist/product/product";

const PRODUCT_SERVICE_URL = process.env.USER_SERVICE_URL || "0.0.0.0:50051";

function main() {
  const client = new ProductServiceClient(
    PRODUCT_SERVICE_URL,
    credentials.createInsecure()
  );

  const req: CreateProductRequest = {
    name: "test product",
    description: "foo bar",
    image: "https://example.com/image",
    tags: ["tag-1"],
  };

  client.createProduct(req, (err, resp) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Response :", resp);
    }
  });
}

main();
