import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { Category, CategoryService } from '../../services/category.service';
import { NestedTreeControl } from '@angular/cdk/tree';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  standalone: true,
  selector: 'app-categories',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatCardModule,
    MatTreeModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatCardModule,
    MatTreeModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule

  ],
  template: `

 <mat-card>
      <mat-card-header>
        <mat-card-title>Create New Category</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field>
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" required>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description"></textarea>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Parent Category</mat-label>
            <mat-select formControlName="parentId">
              <mat-option [value]="null">None</mat-option>
              <mat-option *ngFor="let category of flatCategories" [value]="category.id">
                {{ category.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" [disabled]="!form.valid">
            Create Category
          </button>
        </form>
      </mat-card-content>
    </mat-card>

    <mat-card>
      <mat-card-header>
        <mat-card-title>Categories</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <mat-tree [dataSource]="dataSource" [treeControl]="treeControl">
          <!-- Node templates remain the same -->
        </mat-tree>
      </mat-card-content>
    </mat-card>
    <mat-card>
      <mat-card-header>
        <mat-card-title>Categories</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <mat-tree [dataSource]="dataSource" [treeControl]="treeControl">
          <!-- Leaf Node -->
          <mat-tree-node *matTreeNodeDef="let node" matTreeNodePadding>
            <div class="category-node">
              <mat-icon>insert_drive_file</mat-icon>
              {{ node.name }}
              <button mat-icon-button (click)="deleteCategory(node.id)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </mat-tree-node>

          <!-- Parent Node -->
          <mat-nested-tree-node *matTreeNodeDef="let node; when: hasChild">
            <div class="category-node mat-tree-node" matTreeNodeToggle>
              <button mat-icon-button>
                <mat-icon>
                  {{ treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right' }}
                </mat-icon>
              </button>
              <mat-icon>folder</mat-icon>
              {{ node.name }}
              <button mat-icon-button (click)="deleteCategory(node.id)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
            <div [class.tree-invisible]="!treeControl.isExpanded(node)">
              <ng-container matTreeNodeOutlet></ng-container>
            </div>
          </mat-nested-tree-node>
        </mat-tree>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card {
      margin: 20px;
    }
    .category-node {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
    }
    mat-icon {
      color: #673ab7;
    }
    .tree-invisible {
      display: none;
    }
  `]
})
export class CategoriesComponent implements OnInit {
  treeControl = new NestedTreeControl<Category>(node => node.children);
  dataSource = new MatTreeNestedDataSource<Category>();
  form: FormGroup ;
  flatCategories: Category[] = [];

  constructor(
    private categoryService: CategoryService,
    private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private router: Router

   ) {   this.form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    parentId: [null]
  });
}

  ngOnInit(): void {
    this.loadCategories();
  }

  hasChild = (_: number, node: Category) => !!node.children && node.children.length > 0;

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.dataSource.data = categories;
        this.flatCategories = this.flattenCategories(categories);
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }
  private flattenCategories(categories: Category[]): Category[] {
    return categories.reduce((acc, category) => {
      acc.push(category);
      if (category.children && category.children.length > 0) {
        acc.push(...this.flattenCategories(category.children));
      }
      return acc;
    }, [] as Category[]);
  }


  deleteCategory(id: number): void {
    this.categoryService.deleteCategory(id).subscribe(() => {
      this.loadCategories();
    });
  }
  onSubmit() {
    if (this.form.valid) {
      this.categoryService.createCategory(this.form.value).subscribe({
        next: () => this.router.navigate(['/categories']),
        error: (err) => console.error('Error creating category', err)
      });
    }
  }
}
