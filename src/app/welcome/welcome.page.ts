import { Component, OnInit, ViewChild } from '@angular/core';
import {AlertController, IonSlides, ModalController} from '@ionic/angular';
import { ResetPwPage } from '../reset-pw/reset-pw.page';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {
 
  slideOpts = {
    initialSlide: 0,
    speed: 1000,
    allowTouchMove: false
  };

  @ViewChild('Sliderino')  slides: IonSlides;

  login: boolean = false; // Gibt an ob man sich im Registrieren oder Login befindet

  registerName: any;
  registerMail: any;
  registerPw: any;
  registerPww: any;

  loginMail: any;
  loginPw: any;

  constructor(public authService: AuthenticationService, public alertController: AlertController, public modalController: ModalController) { 
  }

  ngOnInit() {
  }

  async alert(header: any, subHeader: any, message: any, buttons: any) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: [buttons]
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  nextSlide(){
    this.slides.slideNext();
  }

  changeLogin(){
    if(this.login == true){
      this.login = false;
    }
    else{
      this.login = true;
    }
  }

  async register(){
    if(this.registerMail != undefined && this.registerPw != undefined && this.registerPww != undefined && this.registerName != undefined){
      if(this.registerPw == this.registerPww){
        this.authService.createUserWithEmailAndPassword(this.registerMail, this.registerPw, this.registerName);
      }
      else{
        this.alert("Failed", "Passwords do not match", "Please re-check your inputs", "OK");
      }
    }
    else{
      this.alert("Failed", "Empty input fields", "Please fill in every field.", "OK");
    }
  }

  async Login(){
    if(this.loginPw != undefined && this.loginMail){
      this.authService.signInWithEmailAndPassword(this.loginMail, this.loginPw);
    }
    else{
      this.alert("Failed", "Empty input fields", "Please fill in every field.", "OK");
    }
  }

  async passwordForgot(){
    const modal = await this.modalController.create({
      component: ResetPwPage
    });
    return await modal.present();
  }

}
