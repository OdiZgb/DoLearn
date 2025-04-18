import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {

  private apiUrl = 'http://localhost:5055/api/Courses'; // Adjust with your API URL

  constructor(private http: HttpClient) { }

  // Method to get courses
  getCourses(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Method to get a specific course by ID
  getCourse(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
