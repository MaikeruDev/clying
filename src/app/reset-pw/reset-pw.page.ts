import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AlertController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-reset-pw',
  templateUrl: './reset-pw.page.html',
  styleUrls: ['./reset-pw.page.scss'],
})
export class ResetPwPage implements OnInit {

  email: any;

  constructor(public afAuth: AngularFireAuth, private alertController: AlertController, private modalController: ModalController) { }

  ngOnInit() {

  }

  async resetPW(){
    if(this.email){
    this.afAuth.sendPasswordResetEmail(this.email)
    .then(async (res: any) =>{
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Error',
        message: res.message,
        buttons: ['OK']
      });
  
      await alert.present();
    })
    .catch(async (err: any) =>{
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Error',
        message: err.message,
        buttons: ['OK']
      });
  
      await alert.present();
      })
    }
    else{
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Error',
        message: 'Please put in a valid E-Mail.',
        buttons: ['OK']
      });
  
      await alert.present();
    }
  }

  async closeModal(){
    this.modalController.dismiss();
  }

}
