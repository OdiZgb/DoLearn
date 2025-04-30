import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { Category, CategoryService } from '../../services/category.service';
import { NestedTreeControl } from '@angular/cdk/tree';

@Component({
  standalone: true,
  selector: 'app-categories',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatCardModule,
    MatTreeModule
  ],
  template: `
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

  constructor(
    private categoryService: CategoryService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  hasChild = (_: number, node: Category) => !!node.children && node.children.length > 0;

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.dataSource.data = categories;
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  deleteCategory(id: number): void {
    this.categoryService.deleteCategory(id).subscribe(() => {
      this.loadCategories();
    });
  }
}
