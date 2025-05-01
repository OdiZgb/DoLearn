// category-menu-item.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Category } from '../../../services/category.service';

@Component({
  standalone: true,
  selector: 'app-category-menu-item',
  imports: [CommonModule, MatMenuModule, MatButtonModule],
  template: `
    <button mat-menu-item 
            *ngIf="!category.children?.length"
            (click)="selectCategory(category.id)">
      {{ category.name }}
    </button>

    <button mat-menu-item 
            *ngIf="category.children?.length"
            [matMenuTriggerFor]="subMenu"
            (mouseenter)="openSubMenu($event)"
            (click)="$event.preventDefault()">
      {{ category.name }}
      <span class="submenu-indicator">›</span>
    </button>

    <mat-menu #subMenu="matMenu" class="nested-submenu">
      <ng-container *ngFor="let child of category.children">
        <app-category-menu-item 
          [category]="child"
          (categorySelected)="selectCategory($event)">
        </app-category-menu-item>
      </ng-container>
    </mat-menu>
  `
})
export class CategoryMenuItemComponent {
  @Input() category!: Category;
  @Output() categorySelected = new EventEmitter<number>();

  selectCategory(id: number) {
    this.categorySelected.emit(id);
  }

  openSubMenu(event: MouseEvent) {
    const target = event.target as HTMLElement;
    target?.closest('button')?.click();
  }
}