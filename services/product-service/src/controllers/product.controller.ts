import { DataSource } from "typeorm";
import { Product } from "../models/product";

interface createProductReq {
  name: string;
  description: string;
  image: string;
  tags: string[];
}

export const createProduct = async (
  db: DataSource,
  req: createProductReq
): Promise<Product> => {
  const productRepository = db.getRepository(Product);
  const product = new Product();
  product.name = req.name;
  product.description = req.description;
  product.image = req.image;
  product.tags = req.tags;
  return productRepository.save(product);
};
