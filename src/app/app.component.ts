import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { Item } from './classes/item.class';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'water-sort-solver';

  // Дані для списків
  list1 = ['Елемент 1', 'Елемент 2', 'Елемент 3'];
  list2 = ['Елемент 4', 'Елемент 5', 'Елемент 6'];

  // Обробник події "drop"
  drop1(event: CdkDragDrop<string[]>) {
    console.log("drop1");
    if (event.previousContainer === event.container) {
      // Переміщення в межах одного списку
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Переміщення між списками
      transferArrayItem(
        event.previousContainer.data, // Дані з джерела
        event.container.data,         // Дані до місця призначення
        event.previousIndex,          // Індекс елемента в джерелі
        event.currentIndex            // Індекс у списку призначення
      );
    }
  }

  drop2(event: CdkDragDrop<string[]>) {
    console.log("drop2");
    if (event.previousContainer === event.container) {
      // Переміщення в межах одного списку
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Переміщення між списками
      transferArrayItem(
        event.previousContainer.data, // Дані з джерела
        event.container.data,         // Дані до місця призначення
        event.previousIndex,          // Індекс елемента в джерелі
        event.currentIndex            // Індекс у списку призначення
      );
    }
  }


}
