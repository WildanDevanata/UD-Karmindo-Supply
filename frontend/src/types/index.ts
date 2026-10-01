export type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
  color: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  packaging?: string;
  sizes?: string[];
  origin: string;
  certification?: string;
  specs?: string;
};