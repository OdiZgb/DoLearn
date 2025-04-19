import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CoursesService } from "../../../services/courses.service";
import { Router } from "@angular/router";
import { addWeeks, eachDayOfInterval, setHours, setMinutes, isBefore } from 'date-fns';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";


@Component({
  selector: 'app-create-course',
  templateUrl: './create-course.component.html',
  imports: [CommonModule, ReactiveFormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ], // Add these
  styleUrls: ['./create-course.component.scss']
})


export class CreateCourseComponent implements OnInit {
  courseForm!: FormGroup;
  selectedFile?: File;
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  selectedDays: string[] = [];

  constructor(
    private fb: FormBuilder,
    private coursesService: CoursesService,
    public router: Router
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
      recurring: [false],
      repeatInterval: [1],
      sessionStart: [''],
      sessionEnd: [''],
      repeatWeeks: [1, [Validators.min(1), Validators.max(12)]],
      sessions: this.fb.array([])
    });
  }

  get sessions(): FormArray {
    return this.courseForm.get('sessions') as FormArray;
  }

  isDaySelected(day: string): boolean {
    return this.selectedDays.includes(day);
  }

  toggleDay(day: string): void {
    const index = this.selectedDays.indexOf(day);
    if (index > -1) {
      this.selectedDays.splice(index, 1);
    } else {
      this.selectedDays.push(day);
    }
  }

  generateSessions(): void {
    const startDate = new Date(this.courseForm.value.startDate);
    const endDate = new Date(this.courseForm.value.endDate);
    const repeatWeeks = this.courseForm.value.repeatWeeks;
    const sessionStart = this.courseForm.value.sessionStart;
    const sessionEnd = this.courseForm.value.sessionEnd;

    this.sessions.clear();

    for (let week = 0; week < repeatWeeks; week++) {
      const weekStart = addWeeks(startDate, week * this.courseForm.value.repeatInterval);
      const weekEnd = addWeeks(endDate, week * this.courseForm.value.repeatInterval);

      eachDayOfInterval({ start: weekStart, end: weekEnd }).forEach(date => {
        const dayName = this.daysOfWeek[date.getDay()];
        if (this.selectedDays.includes(dayName)) {
          const startTime = this.setTime(date, sessionStart);
          const endTime = this.setTime(date, sessionEnd);

          if (isBefore(startTime, endTime)) {
            this.sessions.push(this.fb.group({
              startTime: [startTime.toISOString(), Validators.required],
              endTime: [endTime.toISOString(), Validators.required],
              active: [true]
            }));
          }
        }
      });
    }
  }

  private setTime(date: Date, timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    return setMinutes(setHours(date, hours), minutes);
  }

  removeSession(index: number): void {
    this.sessions.removeAt(index);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit() {
    if (this.courseForm.invalid || !this.selectedFile) {
      this.courseForm.markAllAsTouched();
      return;
    }

    const fd = new FormData();
    const raw = this.courseForm.getRawValue();

    // Basic fields
    fd.append('title',       raw.title);
    fd.append('description', raw.description);
    fd.append('courseCode',  raw.courseCode);
    fd.append('startDate',   raw.startDate);
    fd.append('endDate',     raw.endDate);
    fd.append('price',       raw.price.toString());

    // Sessions: repeated entries so ASP.NET Core can bind List<DateTime>
    raw.sessions.forEach((s: any) => {
      fd.append('SessionStartTimes', s.startTime);
      fd.append('SessionEndTimes',   s.endTime);
    });

    // File (must match DTO property name "Image")
    fd.append('Image', this.selectedFile, this.selectedFile.name);

    this.coursesService.createCourseWithImage(fd)
      .subscribe({
        next: () => {
          alert('Course created successfully!');
          this.router.navigate(['/courses']);
        },
        error: err => {
          console.error(err);
          alert('Error creating course');
        }
      });
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