import { Component, OnInit } from '@angular/core';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { AngularFireAuth, AngularFireAuthModule } from '@angular/fire/auth';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-add-friends',
  templateUrl: './add-friends.page.html',
  styleUrls: ['./add-friends.page.scss'],
})
export class AddFriendsPage implements OnInit {

  elementType = NgxQrcodeElementTypes.CANVAS;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  qrUID: any;
  scannerEnabled: boolean = false;
  result: any;
  uid: any;
  addMail: any;
  mymail: any;
  friends: any[] = [];
  myname: any;
  mypfp: any;


  constructor(private toastController: ToastController, private afAuth: AngularFireAuth, private modalController: ModalController, public db: AngularFirestore, private alertController: AlertController) {}

  async ngOnInit(){
    this.mymail = (await this.afAuth.currentUser).email;
    this.qrUID = (await this.afAuth.currentUser).uid;
    this.myname = (await this.afAuth.currentUser).displayName;

    this.db.collection('users/').doc(this.qrUID).ref.onSnapshot( (snap: any) => {
        this.mypfp = snap.data().pfp;
    })

    this.db.collection('users/').doc(this.qrUID).collection('friends').ref.onSnapshot( (snap: any) => {
      this.friends = [];
      snap.forEach(friend => {
        this.friends.push(friend.data());
      });
    })
  }

  async scanSuccessHandler(event){
    this.scannerEnabled = false;
    this.result = event;
    
    if(this.friends.length > 0){
      this.db.collection("users").doc(this.qrUID).collection("friends").ref.where("uid", "==", this.result).get().then(async (doc: any) => {
        if(!doc.empty){
          doc.forEach(async element => {
            const alert = await this.alertController.create({
              cssClass: 'my-custom-class',
              header: 'Fail',
              subHeader: 'Thats your friend!',
              message: 'You and ' + element.data().name + ' are already friends!',
              buttons: ['OK']
            });
            await alert.present();
          });
      
        }
        else if (this.result == this.qrUID){
          const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header: 'Hehe ;)',
            subHeader: 'Thats you!',
            message: 'You cant add yourself!',
            buttons: ['OK']
          });
  
          await alert.present();
        }
        else {
          this.db.collection('users/').ref.where("uid", "==", this.result).onSnapshot(async (snap: any) => {
            if(snap.empty){
              const alert = await this.alertController.create({
                cssClass: 'my-custom-class',
                header: 'Fail',
                subHeader: 'Not found',
                message: 'Invalid QR-Code. Please try again.',
                buttons: ['OK']
              });
          
              await alert.present();
            }
            else{
              snap.forEach(async (userFound: any) => {
                const alert = await this.alertController.create({
                  header: 'Success!',
                  message: 'Do you want to add ' + userFound.data().name + ' as a friend?',
                  buttons: [
                    {
                      text: 'Cancel',
                      role: 'cancel',
                      handler: () => {
                        console.log('Cancel clicked');
                      }
                    },
                    {
                      text: 'Add',
                      handler: () => {
                        this.db.collection('users').doc(this.qrUID).collection('achievements').doc("Friends").ref.get().then(async (doc: any) => {
                          if(doc.data().achieved == false){
                            const toast = await this.toastController.create({
                              message: 'Achievement unlocked: "Friends" !',
                              duration: 5000,
                            });
                            toast.present();
                            this.db.collection('users').doc(this.qrUID).collection('achievements').doc("Friends").update({
                              achieved: true
                            })
                          }
                        })
                        this.db.collection('users/').doc(this.qrUID).collection('friends').doc(userFound.id).set({
                          name: userFound.data().name,
                          uid: userFound.id,
                          email: userFound.data().email,
                          pfp: userFound.data().pfp
                        })
                        this.db.collection('users/').doc(userFound.id).collection('friends').doc(this.qrUID).set({
                          name:  this.myname,
                          uid: this.qrUID,
                          email: this.mymail,
                          pfp: this.mypfp
                        }).then(ses => {
                          this.modalController.dismiss();
                        }) 
                      }
                    }
                  ]
                });
                await alert.present();
              });
            }
          })
        }
      })
    }
  }

  async addMailUserr(){
    if(this.friends.length > 0){
      this.db.collection("users").doc(this.qrUID).collection("friends").ref.where("email", "==", this.addMail).get().then(async (doc: any) => {
        if(!doc.empty){
          doc.forEach(async element => {
            const alert = await this.alertController.create({
              cssClass: 'my-custom-class',
              header: 'Fail',
              subHeader: 'Thats your friend!',
              message: 'You and ' + element.data().name + ' are already friends!',
              buttons: ['OK']
            });
            await alert.present();
          });
      
        }
        else if (this.addMail == this.mymail){
          const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header: 'Hehe ;)',
            subHeader: 'Thats you!',
            message: 'You cant add yourself!',
            buttons: ['OK']
          });
  
          await alert.present();
        }
        else {
          this.db.collection('users/').ref.where("email", "==", this.addMail).onSnapshot(async (snap: any) => {
            if(snap.empty){
              const alert = await this.alertController.create({
                cssClass: 'my-custom-class',
                header: 'Fail',
                subHeader: 'Not found',
                message: 'Invalid E-Mail Address. Please try again.',
                buttons: ['OK']
              });
          
              await alert.present();
            }
            else{
              snap.forEach(async (userFound: any) => {
                const alert = await this.alertController.create({
                  header: 'Success!',
                  message: 'Do you want to add ' + userFound.data().name + ' as a friend?',
                  buttons: [
                    {
                      text: 'Cancel',
                      role: 'cancel',
                      handler: () => {
                        console.log('Cancel clicked');
                      }
                    },
                    {
                      text: 'Add',
                      handler: () => {
                        this.db.collection('users').doc(this.qrUID).collection('achievements').doc("Friends").ref.get().then(async (doc: any) => {
                          if(doc.data().achieved == false){
                            const toast = await this.toastController.create({
                              message: 'Achievement unlocked: "Friends" !',
                              duration: 5000,
                            });
                            toast.present();
                            this.db.collection('users').doc(this.qrUID).collection('achievements').doc("Friends").update({
                              achieved: true
                            })
                          }
                        })
                        this.db.collection('users/').doc(this.qrUID).collection('friends').doc(userFound.id).set({
                          name: userFound.data().name,
                          uid: userFound.id,
                          email: userFound.data().email,
                          pfp: userFound.data().pfp
                        })
                        this.db.collection('users/').doc(userFound.id).collection('friends').doc(this.qrUID).set({
                          name:  this.myname,
                          uid: this.qrUID,
                          email: this.mymail,
                          pfp: this.mypfp
                        }).then(ses => {
                          this.modalController.dismiss();
                        })
                      }
                    }
                  ]
                });
                await alert.present();
              });
            }
          })
        }
      })
    }
  }

  activateCam(){
    this.scannerEnabled = true;
  }

  closeModal(){
    this.modalController.dismiss();
  }

}
