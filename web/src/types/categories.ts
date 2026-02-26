export interface Category {
  id: string;
  name: string;
  color: string;
  rules: string[];
  userId: string;
}

export interface CategoryFormData {
  name: string;
  color: string;
  rules: string[];
}
