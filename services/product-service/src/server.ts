import { sendUnaryData, ServerUnaryCall, status } from "@grpc/grpc-js";
import {
  CreateProductRequest,
  CreateProductResponse,
  GetProductRequest,
  GetProductResponse,
  ListProductsRequest,
  ListProductsResponse,
  Product,
  ProductServiceServer,
} from "@rsbh-nodejs-microservices/protos/product/product";
import { DataSource } from "typeorm";
import * as ProductController from "./controllers/product.controller.js";
import {
  ProductEventType,
  ProductEvent,
} from "@rsbh-nodejs-microservices/protos/product/product";
import { v4 as uuid } from "uuid";
import type { KafkaClient } from "./clients/kafka.client.js";

const TOPICS = {
  PRODUCT_CREATED: "product.created",
} as const;

export function getProductServer(
  db: DataSource,
  kafkaClient: KafkaClient
): ProductServiceServer {
  async function createProduct(
    call: ServerUnaryCall<CreateProductRequest, CreateProductResponse>,
    callback: sendUnaryData<CreateProductResponse>
  ) {
    try {
      const product = await ProductController.createProduct(db, call.request);
      const productPB = Product.fromJSON(product);
      const response: CreateProductResponse = {
        product: productPB,
      };

      const event = ProductEvent.create({
        id: uuid(),
        type: ProductEventType.PRODUCT_EVENT_TYPE_CREATED,
        product: productPB,
        timestamp: new Date(),
      });

      await kafkaClient.publishEvent(
        TOPICS.PRODUCT_CREATED,
        product.id.toString(),
        Buffer.from(ProductEvent.encode(event).finish())
      );
      callback(null, response);
    } catch (err) {
      callback({ code: status.INTERNAL }, null);
      console.error(err);
    }
  }
  async function getProduct(
    call: ServerUnaryCall<GetProductRequest, GetProductResponse>,
    callback: sendUnaryData<GetProductResponse>
  ) {
    try {
      const product = await ProductController.getProduct(db, call.request.id);
      if (product) {
        const productPB = Product.fromJSON(product);
        const response: GetProductResponse = {
          product: productPB,
        };
        callback(null, response);
      } else {
        callback(
          {
            code: status.NOT_FOUND,
            message: `Product ${call.request.id} not found`,
          },
          null
        );
      }
    } catch (err) {
      callback({ code: status.INTERNAL }, null);
      console.error(err);
    }
  }
  async function listProducts(
    call: ServerUnaryCall<ListProductsRequest, ListProductsResponse>,
    callback: sendUnaryData<ListProductsResponse>
  ) {
    try {
      const products = await ProductController.listProducts(db);
      const productsPB = products.map(Product.fromJSON);
      const response: ListProductsResponse = {
        products: productsPB,
      };
      callback(null, response);
    } catch (err) {
      callback({ code: status.INTERNAL }, null);
      console.error(err);
    }
  }

  return {
    createProduct,
    getProduct,
    listProducts,
  };
}
