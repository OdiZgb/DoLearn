import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../models/Course';

export interface Category {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
  parent: Category | null;
  children: Category[];
}
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = 'http://localhost:5055/api/categories/'; // Hell yeah we remember

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  createCategory(category: Omit<Category, 'id'>): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }
  getCategoriesWithHierarchy(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/hierarchy`);
  }

  getCoursesByCategoryId(categoryId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/${categoryId}/courses`);
  }
}