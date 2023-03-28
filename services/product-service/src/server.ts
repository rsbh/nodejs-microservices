import { sendUnaryData, ServerUnaryCall, status } from "@grpc/grpc-js";
import {
  CreateProductRequest,
  CreateProductResponse,
  GetProductRequest,
  GetProductResponse,
  ListProductsRequest,
  ListProductsResponse,
  ProductServiceServer,
} from "@nodejs-microservices/protos/dist/product/product";
import { DataSource } from "typeorm";

export function getProductServer(db: DataSource): ProductServiceServer {
  async function createProduct(
    call: ServerUnaryCall<CreateProductRequest, CreateProductResponse>,
    callback: sendUnaryData<CreateProductResponse>
  ) {
    callback({ code: status.UNIMPLEMENTED }, null);
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
