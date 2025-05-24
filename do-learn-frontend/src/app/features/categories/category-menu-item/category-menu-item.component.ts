import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  AfterViewInit,
  ElementRef
} from '@angular/core';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { Category } from '../../../services/category.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-category-menu-item',
  templateUrl: './category-menu-item.component.html',
  styleUrls: ['./category-menu-item.component.scss'],
  imports:[    MatMenuModule,
    CommonModule,
    RouterModule,
    MatCardModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule
  ]
})
export class CategoryMenuItemComponent implements AfterViewInit {
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger | undefined ;
  @Input() category!: Category;
  @Input() path: CategoryMenuItemComponent[] = [];
  @Output() categorySelected = new EventEmitter<number>();

  static openPath: CategoryMenuItemComponent[] = [];
  static rootY: number = 100; // Fixed Y position for all menus
  readonly offsetX = 300; // per level

  get level(): number {
    return this.path.length;
  }

  get updatedPath(): CategoryMenuItemComponent[] {
    return [...this.path, this];
  }

  ngAfterViewInit(): void {
    this.menuTrigger?.menuOpened.subscribe(() => {
      this.closeUnrelatedMenus();
      CategoryMenuItemComponent.openPath.push(this);
      setTimeout(() => this.lockPosition(), 0); // ensure DOM is ready
    });
  }

  handleHover(): void {
    if(this.menuTrigger)
    if (!this.menuTrigger?.menuOpen) {
      this.menuTrigger.openMenu();
    }
  }

  closeUnrelatedMenus(): void {
    const newPath = this.updatedPath;
    const oldPath = CategoryMenuItemComponent.openPath;
    for (const c of oldPath) {
      if (!newPath.includes(c)) {
        c.menuTrigger?.closeMenu();
      }
    }
    CategoryMenuItemComponent.openPath = newPath;
  }

  lockPosition(): void {
    const overlayEl = (this.menuTrigger as any)?._overlayRef?.overlayElement as HTMLElement;
    if (overlayEl) {
      overlayEl.style.top = `${CategoryMenuItemComponent.rootY}px`;
      overlayEl.style.left = `${(this.level + 1) * this.offsetX}px`;
      overlayEl.style.position = 'fixed';
    }
  }

  selectCategory(id: number): void {
    this.categorySelected.emit(id);
    for (const c of CategoryMenuItemComponent.openPath) {
      c.menuTrigger?.closeMenu();
    }
    CategoryMenuItemComponent.openPath = [];
  }
}
