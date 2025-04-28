import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { Category, CategoryService } from '../../services/category.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  standalone: true,
  selector: 'app-categories',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Categories</mat-card-title>
      </mat-card-header>
      <mat-card-actions>
        <button mat-raised-button color="primary" routerLink="/categories/new">
          Add New Category
        </button>
      </mat-card-actions>
<mat-card-content>
  <table mat-table [dataSource]="categories">
    <!-- Id Column -->
    <ng-container matColumnDef="id">
      <th mat-header-cell *matHeaderCellDef>ID</th>
      <td mat-cell *matCellDef="let category">{{ category.id }}</td>
    </ng-container>

    <!-- Name Column -->
    <ng-container matColumnDef="name">
      <th mat-header-cell *matHeaderCellDef>Name</th>
      <td mat-cell *matCellDef="let category">{{ category.name }}</td>
    </ng-container>

    <!-- Children Column -->
    <ng-container matColumnDef="children">
      <th mat-header-cell *matHeaderCellDef>Children</th>
      <td mat-cell *matCellDef="let category">
        <mat-icon *ngIf="category.children?.length" matTooltip="{{category.children.length}} child categories">
          folder
        </mat-icon>
        <span *ngIf="!category.children?.length">-</span>
      </td>
    </ng-container>

    <!-- Description Column -->
    <ng-container matColumnDef="description">
      <th mat-header-cell *matHeaderCellDef>Description</th>
      <td mat-cell *matCellDef="let category">{{ category.description }}</td>
    </ng-container>

    <!-- Actions Column -->
    <ng-container matColumnDef="actions">
      <th mat-header-cell *matHeaderCellDef>Actions</th>
      <td mat-cell *matCellDef="let category">
        <button mat-icon-button [routerLink]="['edit', category.id]">
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-icon-button (click)="deleteCategory(category.id)">
          <mat-icon>delete</mat-icon>
        </button>
      </td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
  </table>
</mat-card-content>
    </mat-card>
    <ng-container matColumnDef="children">
  <th mat-header-cell *matHeaderCellDef>Children</th>
  <td mat-cell *matCellDef="let category">
    <mat-icon *ngIf="category.children?.length" matTooltip="{{category.children.length}} child categories">
      folder
    </mat-icon>
    <span *ngIf="!category.children?.length">-</span>
  </td>
</ng-container>
    <router-outlet></router-outlet>

  `,
  styles: [`
    mat-card {
      margin: 20px;
    }
    table {
      width: 100%;
    }
    router-outlet {
      margin: 20px;
      display: block;
    }
    mat-icon {
      color: #673ab7;
      vertical-align: middle;
      margin-right: 8px;
    }
    td.mat-column-children {
      width: 100px;
      text-align: center;
    }
  `]
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  displayedColumns = ['id', 'name', 'children', 'description', 'actions'];

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(
      categories => this.categories = categories
    );
  }

  deleteCategory(id: number): void {
    this.categoryService.deleteCategory(id).subscribe(() => {
      this.categories = this.categories.filter(c => c.id !== id);
    });
  }
}