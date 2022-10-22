import { ThrowStmt } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  uid: any;

  constructor(private afAuth: AngularFireAuth, private db: AngularFirestore, private alertController: AlertController) { }

  async createUserWithEmailAndPassword(email, password, name){
    return new Promise<any>((resolve, reject) => {
      this.afAuth.createUserWithEmailAndPassword(email, password).then(credential => {
        credential.user.updateProfile({
          displayName: name,
        })
      }).then(
        async res => {
          await this.afAuth.user.subscribe(user => {
            
            this.uid = user.uid

            this.db.collection("users/").doc(this.uid).set({
              name: name,
              pfp: "https://avatars.dicebear.com/api/gridy/" + this.uid + ".svg",
              email: email.toLowerCase(),
              uid: this.uid,
              points: 0,
              played: 0
            }).then(async ses => {

              this.db.collection("users/").doc(this.uid).collection('achievements').doc('FirstGame').set({
                achieved: false
              })

              this.db.collection("users/").doc(this.uid).collection('achievements').doc('10Games').set({
                achieved: false
              })

              this.db.collection("users/").doc(this.uid).collection('achievements').doc('Friends').set({
                achieved: false
              })

              this.db.collection("users/").doc(this.uid).collection('achievements').doc('Win').set({
                achieved: false
              })

              .then(ses => {
                location.reload();
              })

            })
          })
        },
        async err => {
          const alert = await this.alertController.create({
            header: "Oopsie",
            message: err.message,
            buttons: ["RETRY"]
          })

          await alert.present();
        }
      )
    })
  }

  async signInWithEmailAndPassword(email, password){
    return new Promise<any>((resolve, reject) => {
      this.afAuth.signInWithEmailAndPassword(email, password)
      .then(
        res => {
          location.reload();
        },
        async err => {
          const alert = await this.alertController.create({
            header: "Oopsie",
            message: err.message,
            buttons: ["RETRY"]
          })

          await alert.present();
        }
      )
    })
  }

  async signOut(){
    return new Promise<void>((resolve, reject) => {
      if (this.afAuth.currentUser) {
        this.afAuth.signOut()
          .then(() => {
            resolve();
            location.reload();
          }).catch((error) => {
            reject();
          });
      }
    })
  }

  userDetails(){
    return this.afAuth.user;
  }

}
