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
} from "@nodejs-microservices/protos/dist/product/product";
import { DataSource } from "typeorm";
import * as ProductController from "./controllers/product.controller";

export function getProductServer(db: DataSource): ProductServiceServer {
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
      callback(null, response);
    } catch (err) {
      if (err instanceof Error) {
        callback(err, null);
      }
      console.error(err);
    }
  }
  async function getProduct(
    call: ServerUnaryCall<GetProductRequest, GetProductResponse>,
    callback: sendUnaryData<GetProductResponse>
  ) {
    callback({ code: status.UNIMPLEMENTED }, null);
  }
  async function listProducts(
    call: ServerUnaryCall<ListProductsRequest, ListProductsResponse>,
    callback: sendUnaryData<ListProductsResponse>
  ) {
    callback({ code: status.UNIMPLEMENTED }, null);
  }

  return {
    createProduct,
    getProduct,
    listProducts,
  };
}
