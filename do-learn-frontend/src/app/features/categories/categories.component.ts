import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from './shared/confirm-delete-dialog/confirm-delete-dialog.component';

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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatDialogModule
  ],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  treeControl = new NestedTreeControl<Category>(node => node.children);
  dataSource = new MatTreeNestedDataSource<Category>();
  form: FormGroup;
  flatCategories: Category[] = [];
  loading = false;
  selectedNode: number | null = null;
  editingCategory: Category | null = null;

  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(
    private categoryService: CategoryService,
    private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      parentId: [null]
    });
  }
  toggleExclusive(node: Category): void {
    this.treeControl.dataNodes?.forEach(n => {
      if (n !== node) {
        this.treeControl.collapse(n);
      }
    });
  
    // Toggle the clicked node
    if (this.treeControl.isExpanded(node)) {
      this.treeControl.collapse(node);
    } else {
      this.treeControl.expand(node);
    }
  }
  ngOnInit(): void {
    this.loadCategories();
  }

  hasChild = (_: number, node: Category) => !!node.children && node.children.length > 0;

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.dataSource.data = categories;
        this.flatCategories = this.flattenCategories(categories);
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading categories:', err);
      }
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
      const formData = this.form.value;
      
      if (this.editingCategory) {
        // Update existing category
        this.categoryService.updateCategory(this.editingCategory.id, formData)
          .subscribe({
            next: () => {
              this.sidenav.close();
              this.loadCategories();
              this.editingCategory = null;
            },
            error: (err) => console.error('Error updating category', err)
          });
      } else {
        // Create new category
        this.categoryService.createCategory(formData)
          .subscribe({
            next: () => {
              this.sidenav.close();
              this.loadCategories();
            },
            error: (err) => console.error('Error creating category', err)
          });
      }
    }
  }
  openEditForm(category: Category): void {
    this.editingCategory = category;
    this.form.patchValue({
      name: category.name,
      description: category.description,
      parentId: category.parentId
    });
    this.sidenav.open();
  }
  openCreateForm(): void {
    this.editingCategory = null;
    this.form.reset();
    this.sidenav.open();
  }


  confirmDelete(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { 
        title: 'Delete Category',
        message: 'Are you sure you want to delete this category and all its subcategories?'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteCategory(id);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
  
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        const filtered = this.filterTree(categories, filterValue);
        this.dataSource.data = filtered;
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error filtering categories:', err);
      }
    });
  }
  private filterTree(categories: Category[], filterValue: string): Category[] {
    return categories
      .map(category => {
        const children = category.children ? this.filterTree(category.children, filterValue) : [];
        const matches = category.name.toLowerCase().includes(filterValue) || 
                        category.description?.toLowerCase().includes(filterValue);
        if (matches || children.length > 0) {
          return { ...category, children };
        }
        return null;
      })
      .filter(Boolean) as Category[];
  }
  selectNode(node: Category): void {
    this.selectedNode = node.id;
  }
}