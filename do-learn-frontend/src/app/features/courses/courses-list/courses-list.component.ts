import { Component, OnInit } from '@angular/core';
import { CoursesService } from '../../../services/courses.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
 
@Component({
  selector: 'app-courses-list',
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.scss'],
  
  providers:[    CommonModule,
    
  ]
  
})
export class CoursesListComponent implements OnInit {

  courses = [];

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
