import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  AfterViewInit,
  HostListener,
  ElementRef,
  ViewContainerRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Category } from '../../../services/category.service';
import { Overlay } from '@angular/cdk/overlay';
@Component({
  standalone: true,
  selector: 'app-category-menu-item',
  imports: [CommonModule, MatMenuModule, MatButtonModule],
  templateUrl: './category-menu-item.component.html',
  styleUrls: ['./category-menu-item.component.scss']
})
export class CategoryMenuItemComponent implements AfterViewInit {
  @ViewChild(MatMenuTrigger) menuTrigger?: MatMenuTrigger;
  @Input() path: CategoryMenuItemComponent[] = [];
  @Input() category!: Category;
  @Output() categorySelected = new EventEmitter<number>();
  static openPath: CategoryMenuItemComponent[] = [];
  static rootTop: number | null = null;
  static rootY: number | null = null;
  constructor(
  private elementRef: ElementRef,
  private overlay: Overlay,
  private vcr: ViewContainerRef
) {}
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
ngAfterViewInit(): void {
  this.menuTrigger?.menuOpened.subscribe(() => {
    this.closeUnrelatedMenus();
    CategoryMenuItemComponent.openPath.push(this);

    if (CategoryMenuItemComponent.rootY === null) {
      const triggerElement = this.elementRef.nativeElement;
      const rect = triggerElement.getBoundingClientRect();
      CategoryMenuItemComponent.rootY = 0;
    }
  });
}

  closeUnrelatedMenus(): void {
    const newPath = [...this.path, this];
    const oldPath = CategoryMenuItemComponent.openPath;

    for (const component of oldPath) {
      if (!newPath.includes(component)) {
        component.menuTrigger?.closeMenu();
      }
    }

    CategoryMenuItemComponent.openPath = oldPath;
  }

selectCategory(id: number) {
  this.categorySelected.emit(id);
  for (const comp of CategoryMenuItemComponent.openPath) {
    comp.menuTrigger?.closeMenu();
  }
  CategoryMenuItemComponent.openPath = [];
  CategoryMenuItemComponent.rootY = 0;
}

 
}
