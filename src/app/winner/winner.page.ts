import { i18nMetaToJSDoc } from '@angular/compiler/src/render3/view/i18n/meta';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-winner',
  templateUrl: './winner.page.html',
  styleUrls: ['./winner.page.scss'],
})
export class WinnerPage implements OnInit {

  myuid: any;
  qrUID: any;
  mymail: any;
  myname: any;
  mypfp: any;

  id: any;
  winner: any;

  host: any;
  hostpfp: any;
  hostUID: any;

  clyerUID: any;
  clyerName: any;
  clyerPfp: any;
  clyerMail: any;
  clyerPoints: any;

  roundNum: any;
  players: any[] = [];
  playersNotClyer: any[] = [];
  done: boolean = false;
  playersSorted: any[] = [];

  constructor(public modalController: ModalController, private route : ActivatedRoute, private router : Router, private db: AngularFirestore, public afAuth: AngularFireAuth, private toastController: ToastController, private alertController: AlertController){}

  async ngOnInit() {
    this.myuid = (await this.afAuth.currentUser).uid;
    this.qrUID = (await this.afAuth.currentUser).uid;
    this.mymail = (await this.afAuth.currentUser).email;
    this.myname = (await this.afAuth.currentUser).displayName;
    this.db.collection('users/').doc(this.qrUID).ref.onSnapshot( (snap: any) => {
      this.mypfp = snap.data().pfp;
    })

    this.route.queryParams.subscribe(async params => {
      if (params && params.id) {
        this.id = JSON.parse(params.id);
        this.winner = JSON.parse(params.winner)

        this.db.collection('rooms/').doc(this.id).ref.onSnapshot(async (snap: any) => {
          //If Room Exists
          if(snap.data()){

            //User in round?
            this.db.collection('rooms').doc(this.id).collection('users').ref.where("uid", "==", this.myuid).get().then(async (snap: any) => {
              if(snap.empty){
                this.BackToHome();
              }
            })

            this.db.collection('rooms').doc(this.id).ref.onSnapshot(async (snap: any) => {
              if(snap.data().votingActive == false){
                let navigationExtras: NavigationExtras = {
                  queryParams: {
                    id: JSON.stringify(this.id)
                  }
                };
                
                this.router.navigate(['running-game'], navigationExtras);
              }
            })

            this.db.collection('users').doc(snap.data().host).ref.onSnapshot(async (user: any) => {
              this.host = user.data().name;
              this.hostpfp = user.data().pfp;
              this.hostUID = user.id;
            });

            //Get Round
            this.roundNum = snap.data().round;

            this.db.collection('rooms').doc(this.id).collection('clyer').doc('round' + this.roundNum).ref.get().then(async (doc: any) => {
              this.clyerUID = doc.data().uid
              this.clyerName = doc.data().name
              this.clyerPfp = doc.data().pfp
              this.clyerMail = doc.data().mail
              this.db.collection('rooms').doc(this.id).collection('users').doc(this.clyerUID).ref.get().then(async (doc: any) => {
                this.clyerPoints = doc.data().points
              })
            }).then(() => {
              this.db.collection('rooms').doc(this.id).collection('users').ref.onSnapshot(async (users: any) => {
                this.players = [];
                this.playersNotClyer = [];
  
                users.forEach(async element => {
                  await this.players.push(element.data())
                  if(element.data().uid != this.clyerUID){
                    await this.playersNotClyer.push(element.data())
                  }
                })


                if(snap.data().done == true){
                  this.done = true;
                  this.playersSorted = this.players
                  this.playersSorted.sort((a, b) => (a.points < b.points) ? 1 : -1)
                }

              })
            })
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

  async finish(){
    this.done = true
    this.db.collection('rooms').doc(this.id).update({
      done: true
    })
  }

  async continue(){
    this.db.collection('rooms').doc(this.id).update({
      clyerSet: false,
      round: this.roundNum + 1,
      votes: 0,
      votingActive: false,
      talkingPlayer: 0
    })

    this.playersNotClyer.forEach(player => {
      if(this.winner == "Clyer"){
        this.db.collection('rooms').doc(this.id).collection('users').doc(player.uid).update({
          points: player.points - 200,
          voted: false,
          votes: 0
        })
      }
      else{
        this.db.collection('rooms').doc(this.id).collection('users').doc(player.uid).update({
          points: player.points + 500,
          voted: false,
          votes: 0
        })
      }
    })

    if(this.winner == "Clyer"){
      this.db.collection('rooms').doc(this.id).collection('users').doc(this.clyerUID).update({
        points: this.clyerPoints + 500,
        voted: false,
        votes: 0
      })
    }
    else{
      this.db.collection('rooms').doc(this.id).collection('users').doc(this.clyerUID).update({
        points: this.clyerPoints - 200,
        voted: false,
        votes: 0
      })
    }

    this.players.forEach(player => {/* 
      var points = player.points;
      if(player.uid == this.clyerUID && this.winner == "Clyer"){
        points += 500
      }
      else if(player.uid != this.clyerUID && this.winner == "Clyer"){
        points -= 200
      }
      else if(player.uid == this.clyerUID && this.winner == "nClyer"){
        points -= 200
      }
      else if(player.uid != this.clyerUID && this.winner == "nClyer"){
        points += 200
      } */

      /* this.db.collection('rooms').doc(this.id).collection('users').doc(player.uid).update({
        votes: 0,
        voted: false,
        points: points
      }).then( () => { */
        let navigationExtras: NavigationExtras = {
          queryParams: {
            id: JSON.stringify(this.id)
          }
        };
        this.router.navigate(['running-game'], navigationExtras);
      })/* 
    }); */
  }

  async BackToHome(){
    this.router.navigate(['home']);
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

}
