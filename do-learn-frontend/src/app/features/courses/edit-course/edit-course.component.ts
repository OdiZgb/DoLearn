import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursesService } from '../../../services/courses.service';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../services/category.service';
import { addWeeks, eachDayOfInterval, setHours, setMinutes, isBefore } from 'date-fns';

@Component({
  selector: 'app-edit-course',
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.scss']
})
export class EditCourseComponent implements OnInit {
  courseForm!: FormGroup;
  selectedFile?: File;
  existingImageUrl: string | null = null;
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  selectedDays: string[] = [];
  categories: Category[] = [];
  flattenedCategories: Array<{id: number, nameWithHierarchy: string}> = [];
  courseId!: number;
  deletedSessionIds: number[] = [];

  constructor(
    private fb: FormBuilder,
    private coursesService: CoursesService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.initializeForm();
    this.loadCourseData();
    this.loadCategories();
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

  private loadCourseData(): void {
    this.coursesService.getCourse(this.courseId).subscribe({
      next: (course: any) => {
        this.existingImageUrl = course.imgURL;
        
        // Populate form with course data
        this.courseForm.patchValue({
          title: course.title,
          courseCode: course.courseCode,
          categoryId: course.category.id,
          description: course.description,
          startDate: this.formatDateForInput(course.startDate),
          endDate: this.formatDateForInput(course.endDate),
          price: course.price
        });

        // Load sessions if they exist
        if (course.schedule?.sessions?.length) {
          this.populateSessions(course.schedule.sessions);
        }
      },
      error: (err) => console.error('Failed to load course', err)
    });
  }

  private populateSessions(sessions: any[]): void {
    const sessionArray = this.sessions;
    sessionArray.clear();
    
    sessions.forEach(session => {
      sessionArray.push(this.fb.group({
        id: [session.id],
        startTime: [new Date(session.start).toISOString(), Validators.required],
        endTime: [new Date(session.finish).toISOString(), Validators.required],
        active: [!session.isCanceled]
      }));
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe(cats => {
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

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);
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
    // Keep existing sessions
    const existingSessions = this.sessions.controls.filter(
      control => control.value.id
    );

    // Clear only generated sessions (without IDs)
    for (let i = this.sessions.length - 1; i >= 0; i--) {
      if (!this.sessions.at(i).value.id) {
        this.sessions.removeAt(i);
      }
    }

    // Generate new sessions
    if (!this.selectedDays.length || !this.validateSessionTimes()) {
      return;
    }

    const startDate = new Date(this.courseForm.value.startDate);
    const endDate = new Date(this.courseForm.value.endDate);
    const repeatInterval = parseInt(this.courseForm.value.repeatInterval) || 1;
    const [startHours, startMinutes] = this.courseForm.value.sessionStart.split(':').map(Number);
    const [endHours, endMinutes] = this.courseForm.value.sessionEnd.split(':').map(Number);
    const repeatWeeks = parseInt(this.courseForm.value.repeatWeeks) || 1;

    const allSessions: FormGroup[] = [];

    // Calculate the end date based on repeatWeeks
    const calculatedEndDate = addWeeks(startDate, repeatWeeks * repeatInterval);
    const finalEndDate = isBefore(calculatedEndDate, endDate) ? calculatedEndDate : endDate;

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

        allSessions.push(this.fb.group({
          startTime: [startTime.toISOString(), Validators.required],
          endTime: [endTime.toISOString(), Validators.required],
          active: [true]
        }));
      }
    });

    // Sort and add sessions
    allSessions.sort((a, b) => 
      new Date(a.value.startTime).getTime() - new Date(b.value.startTime).getTime()
    ).forEach(session => this.sessions.push(session));
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
    const session = this.sessions.at(index).value;
    if (session.id) {
      this.deletedSessionIds.push(session.id);
    }
    this.sessions.removeAt(index);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit() {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    const fd = new FormData();
    const raw = this.courseForm.getRawValue();

    // Basic fields
    fd.append('id', this.courseId.toString());
    fd.append('title', raw.title);
    fd.append('description', raw.description);
    fd.append('CategoryId', raw.categoryId.toString());
    fd.append('courseCode', raw.courseCode);
    fd.append('startDate', new Date(raw.startDate).toISOString());
    fd.append('endDate', new Date(raw.endDate).toISOString());
    fd.append('price', raw.price.toString());

    // Sessions
    const sessions = raw.sessions.map((s: any) => ({
      id: s.id,
      startTime: new Date(s.startTime).toISOString(),
      endTime: new Date(s.endTime).toISOString(),
      isCanceled: !s.active
    }));
    
    fd.append('sessions', JSON.stringify(sessions));
    fd.append('deletedSessionIds', JSON.stringify(this.deletedSessionIds));

    // File if changed
    if (this.selectedFile) {
      fd.append('Image', this.selectedFile, this.selectedFile.name);
    } else if (this.existingImageUrl) {
      fd.append('imgURL', this.existingImageUrl);
    }

    this.coursesService.updateCourse(this.courseId, fd).subscribe({
      next: () => {
        alert('Course updated successfully!');
        this.router.navigate(['/courses', this.courseId]);
      },
      error: (err:any) => {
        console.error(err);
        alert('Error updating course');
      }
    });
  }
}