import { Route } from '@angular/compiler/src/core';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-running-game',
  templateUrl: './running-game.page.html',
  styleUrls: ['./running-game.page.scss'],
})
export class RunningGamePage implements OnInit {

  starting: boolean = true;

  myuid: any;
  id: any;
  host: any;
  hostpfp: any;
  hostUID: any;

  players: any[] = [];
  playersInvHidden: any[] = [];

  clyer: any;
  clyerUID: any;
  clyerName: any;
  clyerPfp: any;
  clyerMail: any;

  roundNum: any = 0;
  isClyer: any;

  talkingPlayer: any = 0;

  constructor(public modalController: ModalController, private route : ActivatedRoute, private router : Router, private db: AngularFirestore, public afAuth: AngularFireAuth, private toastController: ToastController, private alertController: AlertController){}

  async ngOnInit() {
    this.myuid = (await this.afAuth.currentUser).uid;
    this.route.queryParams.subscribe(async params => {
      if (params && params.id) {
        this.id = JSON.parse(params.id);
        
        this.db.collection('rooms/').doc(this.id).ref.onSnapshot(async (snap: any) => {
          if(snap.data()){
            this.db.collection('users').doc(snap.data().host).ref.onSnapshot(async (user: any) => {
              this.host = user.data().name;
              this.hostpfp = user.data().pfp;
              this.hostUID = user.id;

              //Is user in this round?
              this.db.collection('rooms').doc(this.id).collection('users').ref.where("uid", "==", this.myuid).get().then(async (snap: any) => {
                if(snap.empty){
                  this.BackToHome();
                }
              })

              //Did voting start?
              this.db.collection('rooms').doc(this.id).ref.onSnapshot(async (doc: any) => {
                if(doc.data().votingActive == true){
                  let navigationExtras: NavigationExtras = {
                    queryParams: {
                      id: JSON.stringify(this.id)
                    }
                  };
                  this.router.navigate(['voting'], navigationExtras);
                }
              })

              //Get Players
              this.db.collection('rooms').doc(this.id).collection('users').ref.onSnapshot(async (users: any) => {
                this.players = [];
                this.playersInvHidden = [];
                users.forEach(element => {
                  this.players.push(element.data())
                  this.playersInvHidden.push(element.data())
                });
                
                this.talkingPlayer = snap.data().talkingPlayer;
                this.roundNum = snap.data().round;

                if(this.myuid == this.hostUID && snap.data().clyerSet == false){
                  this.db.collection('rooms').doc(this.id).update({
                    clyerSet: true,
                    round: this.roundNum
                  })
                  this.clyer = this.getRandomInt(this.players.length)
                  this.clyerName = this.players[this.clyer].name;
                  this.clyerUID = this.players[this.clyer].uid;
                  this.clyerPfp = this.players[this.clyer].pfp;
                  this.clyerMail = this.players[this.clyer].email;
  
                  this.db.collection('rooms').doc(this.id).collection('clyer').doc("round" + this.roundNum).set({
                    name: this.clyerName,
                    uid: this.clyerUID,
                    pfp: this.clyerPfp,
                    email: this.clyerMail
                  })
                }
                else{
                  this.db.collection('rooms').doc(this.id).collection('clyer').doc("round" + this.roundNum).ref.onSnapshot(async (doc: any) => {
                    this.clyerName = doc.data().name;
                    this.clyerUID = doc.data().uid;
                    this.clyerPfp = doc.data().pfp;
                    this.clyerMail = doc.data().email;
                  })
                }
                this.db.collection('rooms').doc(this.id).collection('clyer').doc("round" + this.roundNum).ref.onSnapshot(async (doc: any) => {
                  if(doc.data().uid == this.myuid){
                    this.isClyer = "are"
                  }
                  else{
                    this.isClyer = "are not"
                  }
                })
              })
            })
            await this.delay(6000);
            this.starting = false;
          }
          else{
            this.BackToHome();
          }
        })
      }
      else{
        this.BackToHome();
      }
    })
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  async BackToHome(){
    this.router.navigate(['home']);
  }

  async leaveGame(){
    if(this.clyerUID == this.myuid || this.players.length <= 3){
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Do you want to leave the game?',
        message: 'This will END the game for EVERYONE!',
        buttons: [
          {
            text: 'YES',
            role: 'yes',
            handler: async () => {
              this.db.collection('rooms').doc(this.id).update({
                cancelled: true
              }).then(async () => {
                this.db.collection('rooms').doc(this.id).collection('clyer').ref.onSnapshot(async (clyer: any) => {
                  clyer.forEach(element => {
                    this.db.collection('rooms').doc(this.id).collection('clyer').doc(element.id).delete()
                  });
                })
                this.db.collection('rooms').doc(this.id).collection('users').ref.onSnapshot(async (users: any) => {
                  users.forEach(element => {
                    this.db.collection('rooms').doc(this.id).collection('users').doc(element.id).delete().then(ses => {
                      this.db.collection('rooms').doc(this.id).delete();
                      this.router.navigate(['home']);
                    })
                  })
                })  
              })
            }
          },
          "No"
        ]
      });
      await alert.present();
    }
    else{
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Do you want to leave the game?',
        message: 'This will ruin the game experience for other players!.',
        buttons: [
          {
            text: 'YES',
            role: 'yes',
            handler: async () => {
              this.db.collection('rooms').doc(this.id).collection('users').doc(this.myuid).delete().then(() => {
                this.talkingPlayer -= 1;
                this.db.collection('rooms').doc(this.id).update({
                  talkingPlayer: this.talkingPlayer
                }).then(() => {
                  this.router.navigate(['home']);
                })
              })
  
            }
          },
          "No"
        ]
      });
      await alert.present();
    }
  }

  async nextPlayer(){
    if(this.talkingPlayer < this.players.length - 1){
      this.talkingPlayer += 1;
      this.db.collection('rooms').doc(this.id).update({
        talkingPlayer: this.talkingPlayer
      })
    }
    else{
      this.db.collection('rooms').doc(this.id).update({
        votingActive: true
      })
    }
  }

}
