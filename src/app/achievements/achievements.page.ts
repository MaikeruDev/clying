import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.page.html',
  styleUrls: ['./achievements.page.scss'],
})
export class AchievementsPage implements OnInit {

  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }

  closeModal(){
    this.modalController.dismiss();
  }

}
