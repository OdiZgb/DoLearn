import {
  Component, EventEmitter, Input, Output, ViewChild, AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Category } from '../../../services/category.service';

@Component({
  standalone: true,
  selector: 'app-category-menu-item',
  imports: [CommonModule, MatMenuModule, MatButtonModule],
  template: `
    <button mat-menu-item
            class="menu-item"
            *ngIf="!category.children?.length"
            (click)="selectCategory(category.id)">
      {{ category.name }}
    </button>

    <button mat-menu-item
            class="menu-item has-children"
            *ngIf="category.children?.length"
            [matMenuTriggerFor]="subMenu"
            (mouseenter)="handleHover()"
            (click)="selectCategory(category.id)">
      <span>{{ category.name }}</span>
      <span class="submenu-arrow">›</span>
    </button>

    <mat-menu #subMenu="matMenu"
              class="nested-submenu"
              [overlapTrigger]="false">
      <ng-container *ngFor="let child of category.children">
<app-category-menu-item
  [category]="child"
  [path]="updatedPath"
  (categorySelected)="selectCategory($event)">
</app-category-menu-item>
      </ng-container>
    </mat-menu>
  `,
  styleUrls: ['./category-menu-item.component.scss']
})
export class CategoryMenuItemComponent implements AfterViewInit {
  @ViewChild(MatMenuTrigger) menuTrigger?: MatMenuTrigger;
  @Input() path: CategoryMenuItemComponent[] = [];

  @Input() category!: Category;
  @Output() categorySelected = new EventEmitter<number>();

  static openPath: CategoryMenuItemComponent[] = [];

  ngAfterViewInit(): void {
    // Make sure submenu opens immediately on hover
    this.menuTrigger?.menuOpened.subscribe(() => {
      this.closeUnrelatedMenus();
      CategoryMenuItemComponent.openPath.push(this);
    });
  }
  get updatedPath(): CategoryMenuItemComponent[] {
    return [...this.path, this];
  }
  handleHover(): void {
    if (this.menuTrigger && !this.menuTrigger.menuOpen) {
      this.menuTrigger.openMenu();
    } else {
      this.closeUnrelatedMenus();
    }
  }

  closeUnrelatedMenus(): void {
    const newPath = [...this.path, this];
    const oldPath = CategoryMenuItemComponent.openPath;

    // Close all menus not in the new path
    for (const component of oldPath) {
      if (!newPath.includes(component)) {
        component.menuTrigger?.closeMenu();
      }
    }

    // Update global open path
    CategoryMenuItemComponent.openPath = newPath;
  }

  selectCategory(id: number) {
    this.categorySelected.emit(id);

    // Close all open menus on selection
    for (const comp of CategoryMenuItemComponent.openPath) {
      comp.menuTrigger?.closeMenu();
    }

    CategoryMenuItemComponent.openPath = [];
  }
}
