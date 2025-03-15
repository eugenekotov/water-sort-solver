import { Component, OnInit } from '@angular/core';
import { GameController } from 'src/app/classes/controller/game-controller.class';
import { MainService, TView } from 'src/app/services/main.service';

@Component({
  selector: 'app-save-game',
  templateUrl: './save-game.component.html',
  styleUrls: ['./save-game.component.scss']
})
export class SaveGameComponent implements OnInit {


  /**
   * Відобразити список вже існуючих збережень
   * Можливість вибору збереження для перезапису.
   * Дата та час останнього збереження (опціонально).
   * Кнопка для видалення або перейменування збережень.
   *
   *
   * Кнопка "Зберегти" (активна лише після введення назви).
   * Кнопка "Скасувати" або "Назад".
   * UI/UX рекомендації:
   * Використати список або картки для відображення існуючих збережень.
   * Автоматично пропонувати ім'я за шаблоном (наприклад, "Збереження 1", "Збереження 2").
   * Реалізувати валідацію введених назв (уникати спецсимволів, обмеження довжини).
   */



  protected readonly view: TView = 'save';

  constructor(public mainService: MainService) { }

  ngOnInit(): void {
  }

  onSaveClick() {
    const gameCode: String = GameController.getGameHash(this.mainService.game!.containers);
    console.log("game hex", gameCode);
  }

}
