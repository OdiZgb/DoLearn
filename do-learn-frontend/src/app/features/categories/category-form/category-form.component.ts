import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Category, CategoryService } from '../../../services/category.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  standalone: true,
  selector: 'app-category-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
    MatSelectModule,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ title }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="fill">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name">
          </mat-form-field>

  <mat-form-field appearance="fill">
    <mat-label>Parent Category</mat-label>
    <mat-select formControlName="parentId">
    <mat-select>
      <mat-option [value]="null">None</mat-option>
    </mat-select>      <mat-option *ngFor="let cat of categories" [value]="cat.id">
        {{ cat.name }}
      </mat-option>
    </mat-select>
  </mat-form-field>

          <div class="button-row">
            <button mat-raised-button color="primary" type="submit">
              {{ isEditMode ? 'Update' : 'Create' }}
            </button>
            <button mat-raised-button type="button" routerLink="/categories">
              Cancel
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    /* Critical font fixes */
    body {
      font-family: 'Roboto', sans-serif !important;
    }
    
    .material-icons {
      font-family: 'Material Icons' !important;
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #616161;
    }
  
    /* Force text rendering */
    .node-text {
      font-family: 'Roboto', sans-serif !important;
      font-weight: 500;
      font-size: 14px;
      letter-spacing: 0.25px;
    }
  
    /* Remove any font transformations */
    mat-tree, mat-card, mat-card-content {
      font-family: inherit !important;
      text-transform: none !important;
    }
  `]
})
export class CategoryFormComponent implements OnInit {
  categoryForm: FormGroup; // ← Declare without initialization


  isEditMode = false;
  title = 'New Category';
  categoryId?: number;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder, // ← Use proper dependency injection
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      parentId: [null] 
    });
    this.isEditMode = !!this.route.snapshot.paramMap.get('id');
    this.title = this.isEditMode ? 'Edit Category' : 'New Category';
  }

  ngOnInit(): void {
    this.loadCategories();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.title = 'Edit Category';
        this.categoryId = +params['id'];
        this.loadCategory(this.categoryId);
      }
    });
  }

  loadCategory(id: number): void {
    this.categoryService.getCategory(id).subscribe(category => {
      this.categoryForm.patchValue(category);
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) return;

    const formData = this.categoryForm.value;
    const categoryData: Omit<Category, 'id'> = {
      name: formData.name,
      description: formData.description,
      parentId: formData.parentId,
      parent: null, // <== ADD THIS!!
      children: []   // children are empty when creating new
    };
    if (this.isEditMode && this.categoryId) {
      this.categoryService.updateCategory(this.categoryId, categoryData)
        .subscribe(() => this.router.navigate(['/categories']));
    } else {
      this.categoryService.createCategory(categoryData)
        .subscribe(() => this.router.navigate(['/categories']));
    }
    console.log(categoryData,'categoryDatacategoryDatacategoryData')

  }
  loadCategories(): void {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
      
      if (this.isEditMode) {
        // Remove current category from parent options
        this.categories = this.categories.filter(
          c => c.id !== this.categoryId
        );
      }
    });
  }
}export interface CreateCategoryRequest {
  name: string;
  description: string;
  parentId: number | null;
}