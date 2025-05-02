// category-menu-item.component.ts
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
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
            *ngIf="!category?.children?.length"
            (click)="selectCategory(category.id)">
      {{ category.name }}
    </button>

<button mat-menu-item  
        *ngIf="category?.children?.length"
        [matMenuTriggerFor]="subMenu"
        (mouseenter)="openSubMenu()"
        (mouseleave)="scheduleClose()"
        (click)="selectCategory(category.id)"> <!-- Changed this line -->
  {{ category.name }}
  <span class="submenu-indicator">›</span>
</button>
    <mat-menu #subMenu="matMenu" class="nested-submenu" [overlapTrigger]="false">
      <ng-container *ngFor="let child of category.children">
        <app-category-menu-item  
          [category]="child"
          [parentMenu]="this"
          (categorySelected)="selectCategory($event)">
        </app-category-menu-item>
      </ng-container>
    </mat-menu>
  `,
  styleUrls: ['./category-menu-item.component.scss'],

})
export class CategoryMenuItemComponent {
  @ViewChild(MatMenuTrigger) menuTrigger?: MatMenuTrigger;
  @Input() category!: Category;
  @Input() parentMenu?: CategoryMenuItemComponent;
  @Output() categorySelected = new EventEmitter<number>();
  
  private closeTimeout: any;
  static activeComponent: CategoryMenuItemComponent | null = null;



  openSubMenu() {
    clearTimeout(this.closeTimeout);

    // Check if we're in the same hierarchy
    let currentParent = this.parentMenu;
    let isInHierarchy = false;
    
    while (currentParent) {
      if (currentParent === CategoryMenuItemComponent.activeComponent) {
        isInHierarchy = true;
        break;
      }
      currentParent = currentParent.parentMenu;
    }

    // Close only if not in the same hierarchy
    if (!isInHierarchy && CategoryMenuItemComponent.activeComponent) {
      CategoryMenuItemComponent.activeComponent.menuTrigger?.closeMenu();
    }

    if (this.menuTrigger) {
      this.menuTrigger.openMenu();
      CategoryMenuItemComponent.activeComponent = this;
    }
  }
  selectCategory(id: number) {
    this.categorySelected.emit(id);
    
    // Close all parent menus
    let currentParent = this.parentMenu;
    while (currentParent) {
      currentParent.menuTrigger?.closeMenu();
      currentParent = currentParent.parentMenu;
    }
  }
  scheduleClose() {
    this.closeTimeout = setTimeout(() => {
      if (this.menuTrigger?.menuOpen) {
        if (CategoryMenuItemComponent.activeComponent === this) {
          CategoryMenuItemComponent.activeComponent = null;
        }
      }
    }, 300);
  }
}