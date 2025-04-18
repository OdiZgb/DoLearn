import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CoursesService } from '../../../services/courses.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-course',
  templateUrl: './create-course.component.html',
  imports: [CommonModule, ReactiveFormsModule], // Add these
  styleUrls: ['./create-course.component.scss']
})
export class CreateCourseComponent implements OnInit {
  courseForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private coursesService: CoursesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      courseCode: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{3,10}$/)]],
      description: ['', [Validators.maxLength(500)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      sessions: this.fb.array([this.createSessionGroup()])
    });
  }

  get sessions(): FormArray {
    return this.courseForm.get('sessions') as FormArray;
  }

  private createSessionGroup(): FormGroup {
    return this.fb.group({
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  addSession(): void {
    this.sessions.push(this.createSessionGroup());
  }

  removeSession(index: number): void {
    this.sessions.removeAt(index);
  }

  onSubmit(): void {
    if (this.courseForm.valid) {
      const formData = this.transformFormData();
      this.coursesService.createCourse(formData).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
    } else {
      this.markAllAsTouched();
    }
  }

  private transformFormData(): any {
    const rawValue = this.courseForm.getRawValue();
    return {
      title: rawValue.title,
      description: rawValue.description,
      courseCode: rawValue.courseCode,
      startDate: new Date(rawValue.startDate),
      endDate: new Date(rawValue.endDate),
      price: parseFloat(rawValue.price),
      sessionStartTimes: rawValue.sessions.map((s:any)  => new Date(s.startTime)),
      sessionEndTimes: rawValue.sessions.map((s:any) => new Date(s.endTime))
    };
  }

  private markAllAsTouched(): void {
    Object.values(this.courseForm.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormArray) {
        control.controls.forEach(group => group.markAsTouched());
      }
    });
  }

  private handleSuccess(): void {
    alert('Course created successfully!');
    this.router.navigate(['/courses']);
  }

  private handleError(err: any): void {
    console.error('Creation error:', err);
    alert(err.error?.message || 'Error creating course');
  }
}