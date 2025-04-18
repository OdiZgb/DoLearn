import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CoursesService } from '../../../services/courses.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.scss']
})
export class CreateCourseComponent {
  courseForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private coursesService: CoursesService,
    private router: Router
  ) {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      courseCode: ['', Validators.required],
      description: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      price: [0, Validators.required],
      sessions: this.fb.array([]) // Changed to single FormArray of groups
    });
  }

  get sessions() {
    return this.courseForm.get('sessions') as FormArray;
  }

  addSession() {
    this.sessions.push(this.fb.group({
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    }));
  }

  removeSession(index: number) {
    this.sessions.removeAt(index);
  }

  onSubmit() {
    if (this.courseForm.valid) {
      this.coursesService.createCourse(this.courseForm.value).subscribe({
        next: () => {
          alert('Course created!');
          this.router.navigate(['/courses']);
        },
        error: (err) => {
          console.error(err);
          alert('Error creating course.');
        }
      });
    }
  }
}