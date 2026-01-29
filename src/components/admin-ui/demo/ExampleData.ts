export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  status: "active" | "out_of_stock" | "discontinued";
  stock: number;
}

export const mockProducts: Product[] = [
  { id: "1", name: "Premium Wireless Headphones", category: "Electronics", price: 299.99, status: "active", stock: 45 },
  { id: "2", name: "Ergonomic Office Chair", category: "Furniture", price: 189.5, status: "active", stock: 12 },
  { id: "3", name: "Mechanical Gaming Keyboard", category: "Electronics", price: 129.0, status: "out_of_stock", stock: 0 },
  { id: "4", name: "Stainless Steel Water Bottle", category: "Accessories", price: 24.99, status: "active", stock: 156 },
  { id: "5", name: "Smart Fitness Tracker", category: "Electronics", price: 79.99, status: "discontinued", stock: 0 },
  { id: "6", name: "Leather Messenger Bag", category: "Accessories", price: 110.0, status: "active", stock: 24 },
  { id: "7", name: "USB-C Docking Station", category: "Electronics", price: 89.0, status: "active", stock: 67 },
  { id: "8", name: "Aroma Diffuser", category: "Home", price: 35.0, status: "active", stock: 89 },
  { id: "9", name: "Portable SSD 1TB", category: "Electronics", price: 149.99, status: "active", stock: 34 },
  { id: "10", name: "Adjustable Standing Desk", category: "Furniture", price: 450.0, status: "active", stock: 8 },
];
