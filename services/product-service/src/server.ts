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
