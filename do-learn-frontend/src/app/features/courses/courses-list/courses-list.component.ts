import { Component, OnInit } from '@angular/core';
import { CoursesService } from '../../../services/courses.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Course } from '../../../models/Course';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
 
@Component({
  standalone: true,
  selector: 'app-courses-list',
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.scss'],
  imports: [CommonModule, ReactiveFormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DatePipe 
  ]
  
})
export class CoursesListComponent implements OnInit {

  courses: Course[] = [];

  constructor(private coursesService: CoursesService,private route: ActivatedRoute) { }

  ngOnInit(): void {
    console.log('Activated route:', this.route); // Just to check

    this.coursesService.getCourses().subscribe(data => {
      this.courses = data;
    }, error => {
      console.error('Error fetching courses', error);
    });
  }
}
