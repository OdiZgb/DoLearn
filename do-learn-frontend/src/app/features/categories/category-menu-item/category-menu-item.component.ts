import {
  Component,
  OnInit,
  AfterViewInit,
  HostListener,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { Category } from '../../../services/category.service';

@Component({
  standalone: true,
  selector: 'app-category-menu-item',
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatExpansionModule
  ],
  templateUrl: './category-menu-item.component.html',
  styleUrls: ['./category-menu-item.component.scss']
})
export class CategoryMenuItemComponent implements OnInit, AfterViewInit {
  @Input() category!: Category;
  @Input() path: CategoryMenuItemComponent[] = [];
  @Output() categorySelected = new EventEmitter<number>();

  @ViewChild(MatMenuTrigger) menuTrigger?: MatMenuTrigger;
  @ViewChild('drawer') drawer?: MatDrawer;

  // static state to sync across all instances:
  static openPath: CategoryMenuItemComponent[] = [];
  static rootY = 100;      // fixed Y for all menus
  readonly offsetX = 200;  // px per level

  isMobile = false;

  ngOnInit() {
    this.checkViewport();
  }

  ngAfterViewInit() {
    // Desktop: whenever a menu opens, lock its overlay position
    this.menuTrigger?.menuOpened.subscribe(() => {
      this.closeUnrelatedMenus();
      CategoryMenuItemComponent.openPath.push(this);
      // give CDK a tick to render the overlay pane
      setTimeout(() => this.lockOverlayPosition(), 0);
    });
  }

  // recompute isMobile on resize
  @HostListener('window:resize')
  checkViewport() {
    this.isMobile = window.innerWidth <= 600;
  }

  // depth = how many ancestors; root is level 0
  get level(): number {
    return this.path.length;
  }

  get updatedPath(): CategoryMenuItemComponent[] {
    return [...this.path, this];
  }

  // Desktop hover behavior
  handleHover() {
    if (!this.menuTrigger?.menuOpen) {
      this.menuTrigger?.openMenu();
    }
  }

  // Close any branch not on our new path
  closeUnrelatedMenus() {
    const newPath = this.updatedPath;
    for (const comp of CategoryMenuItemComponent.openPath) {
      if (!newPath.includes(comp)) {
        comp.menuTrigger?.closeMenu();
      }
    }
    CategoryMenuItemComponent.openPath = newPath;
  }

  // Apply fixed top + cascading left
  lockOverlayPosition() {
    const overlayEl = (this.menuTrigger as any)?._overlayRef?.overlayElement as HTMLElement;
    if (!overlayEl) return;
    overlayEl.style.position = 'fixed';
    overlayEl.style.top      = `${CategoryMenuItemComponent.rootY}px`;
    overlayEl.style.left     = `${(this.level + 1) * this.offsetX}px`;
  }

  // Leaf click: emit and close everything
  selectCategory(id: number) {
    this.categorySelected.emit(id);
    for (const comp of CategoryMenuItemComponent.openPath) {
      comp.menuTrigger?.closeMenu();
    }
    CategoryMenuItemComponent.openPath = [];
    this.drawer?.close();
  }
}
