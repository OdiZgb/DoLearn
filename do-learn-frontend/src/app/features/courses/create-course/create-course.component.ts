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
import { Category, CategoryService } from "../../../services/category.service";
import { QuillModule } from 'ngx-quill';

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
    MatProgressSpinnerModule,
    QuillModule
  ], // Add these
  styleUrls: ['./create-course.component.scss']
})


export class CreateCourseComponent implements OnInit {
  courseForm!: FormGroup;
  selectedFile?: File;
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  selectedDays: string[] = [];
  categories: Category[] = [];
  flattenedCategories: Array<{id: number, nameWithHierarchy: string}> = [];
quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ],
  // Add RTL support
  direction: 'rtl' // Optional for Arabic text direction
}
  constructor(
    private fb: FormBuilder,
    private coursesService: CoursesService,
    private CategoriesService: CategoryService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.CategoriesService.getCategories().subscribe(cats => {
      this.categories = cats;
      this.flattenedCategories = this.flattenCategories(cats);
    });

  }
  private flattenCategories(categories: Category[], parentName: string = '', depth: number = 0): 
    Array<{id: number, nameWithHierarchy: string}> {
    return categories.reduce((acc, category) => {
      const prefix = parentName ? `${parentName} > ` : '';
      acc.push({
        id: category.id,
        nameWithHierarchy: `${' '.repeat(depth * 2)}${prefix}${category.name}`
      });
      
      if (category.children && category.children.length > 0) {
        acc.push(...this.flattenCategories(category.children, category.name, depth + 1));
      }
      return acc;
    }, [] as Array<{id: number, nameWithHierarchy: string}>);
  }

  private initializeForm(): void {
    this.courseForm = this.fb.group({
  title: ['', [Validators.required, Validators.minLength(3)]],
  courseCode: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{3,10}$/)]],
  categoryId: ['', Validators.required],
  description: ['', Validators.maxLength(10000)],
  startDate: ['', Validators.required],
  endDate: ['', Validators.required],
  recurring: [false],
  repeatInterval: [''],
  sessionStart: [''],
  sessionEnd: [''],
  repeatWeeks: [''],
  price: ['', [Validators.required, Validators.min(0)]],
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
  // Validate inputs
  if (!this.selectedDays.length || !this.validateSessionTimes()) {
    return;
  }

  const startDate = new Date(this.courseForm.value.startDate);
  const endDate = new Date(this.courseForm.value.endDate);
  const repeatInterval = parseInt(this.courseForm.value.repeatInterval) || 1;
  const [startHours, startMinutes] = this.courseForm.value.sessionStart.split(':').map(Number);
  const [endHours, endMinutes] = this.courseForm.value.sessionEnd.split(':').map(Number);
  const repeatWeeks = parseInt(this.courseForm.value.repeatWeeks) || 1;

  // Create a Set of existing session start times (as ISO strings) to avoid duplicates
  const existingStartTimes = new Set(
    this.sessions.controls.map(control => control.value.startTime)
  );

  // Calculate the end date based on repeatWeeks
  const calculatedEndDate = addWeeks(startDate, repeatWeeks * repeatInterval);
  const finalEndDate = isBefore(calculatedEndDate, endDate) ? calculatedEndDate : endDate;

  const newSessions: FormGroup[] = [];

  this.selectedDays.forEach(day => {
    const dayIndex = this.daysOfWeek.indexOf(day);
    
    // Find first occurrence of the selected day after start date
    let currentDate = new Date(startDate);
    while (currentDate.getDay() !== (dayIndex + 1) % 7) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Generate sessions for each week
    for (let week = 0; week < repeatWeeks; week += repeatInterval) {
      const sessionDate = new Date(currentDate);
      sessionDate.setDate(sessionDate.getDate() + (7 * week));

      // Skip if beyond the end date
      if (sessionDate > finalEndDate) {
        continue;
      }

      const startTime = new Date(sessionDate);
      startTime.setHours(startHours, startMinutes, 0, 0);

      const endTime = new Date(sessionDate);
      endTime.setHours(endHours, endMinutes, 0, 0);

      const startTimeISO = startTime.toISOString();
      
      // Only add if session doesn't already exist
      if (!existingStartTimes.has(startTimeISO)) {
        newSessions.push(this.fb.group({
          startTime: [startTimeISO, Validators.required],
          endTime: [endTime.toISOString(), Validators.required],
          active: [true]
        }));
      }
    }
  });

  // Add new sessions to existing ones
  newSessions.forEach(session => this.sessions.push(session));
  
  // Sort all sessions by start time
  this.sortSessions();
}

// New function to sort sessions
private sortSessions(): void {
  const sessionsArray = this.sessions.controls;
  const sorted = sessionsArray.slice().sort((a, b) => 
    new Date(a.value.startTime).getTime() - new Date(b.value.startTime).getTime()
  );

  // Clear and repopulate to apply sorting
  this.sessions.clear();
  sorted.forEach(control => this.sessions.push(control));
}
  private setTime(date: Date, timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    return setMinutes(setHours(date, hours), minutes);
  }
  validateDateRange(): boolean {
    const start = new Date(this.courseForm.value.startDate);
    const end = new Date(this.courseForm.value.endDate);
    return start < end;
  }
  
  validateSessionTimes(): boolean {
    const start = this.courseForm.value.sessionStart;
    const end = this.courseForm.value.sessionEnd;
    return start && end && start < end;
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
    fd.append('CategoryId', raw.categoryId.toString());
    fd.append('courseCode',  raw.courseCode);
    fd.append('startDate',   new Date(raw.startDate).toISOString());
    fd.append('endDate',     new Date(raw.endDate).toISOString());
    fd.append('price',       raw.price.toString());

    // Sessions: repeated entries so ASP.NET Core can bind List<DateTime>
    raw.sessions.forEach((s: any) => {
      fd.append('SessionStartTimes', new Date(s.startTime).toISOString());
      fd.append('SessionEndTimes',   new Date(s.endTime).toISOString());
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