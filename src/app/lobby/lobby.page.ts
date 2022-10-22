import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { AngularFireAuth, AngularFireAuthModule } from '@angular/fire/auth';
import { Clipboard } from '@capacitor/clipboard';
import { AddFriendsPage } from '../add-friends/add-friends.page';
import { InvFriendPage } from '../inv-friend/inv-friend.page';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.page.html',
  styleUrls: ['./lobby.page.scss'],
})
export class LobbyPage implements OnInit {

  id: any;
  host: any;
  hostUID: any;
  hostpfp: any;
  players: any[] = [];
  playersInvHidden: any[] = [];
  myuid: any;
  started: any;
  
  constructor(public modalController: ModalController, private route : ActivatedRoute, private router : Router, private db: AngularFirestore, public afAuth: AngularFireAuth, private toastController: ToastController, private alertController: AlertController){}

  async copyID(){
    await Clipboard.write({
      string: this.id
    });

    const toast = await this.toastController.create({
      message: 'ID has been copied to Clipboard.',
      duration: 2000,
    });
    toast.present();
  }

  async ngOnInit() {

    const inviteme = {
      name: "Invite",
      pfp: "https://img.icons8.com/carbon-copy/2x/ffffff/plus.png",
      uid: "inv"
    }

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
              //Get Players
              this.db.collection('rooms').doc(this.id).collection('users').ref.where("uid", "!=", user.id).onSnapshot(async (users: any) => {
                this.players = [];
                this.playersInvHidden = [];
                users.forEach(element => {
                  this.players.push(element.data())
                  this.playersInvHidden.push(element.data())
                });
                if(this.players.length < 9){
                  this.players.push(inviteme)
                }
              })
            })
            if(snap.data().started == true){
              this.started = true;
              this.startForAll();
            }
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
  
  async BackToHome(){
    this.router.navigate(['home']);
  }

  async checkIfInv(uid: any){
    if(uid == "inv"){
      const modal = await this.modalController.create({
        component: InvFriendPage,
        cssClass: 'invFriend',
        componentProps: {
          roomID: this.id,
        }
      });
  
      return await modal.present();
    }
  }
  
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  async startForAll(){
    await this.delay(3500);
    this.started = false;        
    let navigationExtras: NavigationExtras = {
      queryParams: {
        id: JSON.stringify(this.id)
      }
    };
    this.router.navigate(['running-game'], navigationExtras);
  }

  async startGame(){

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Do you want to start the game?',
      message: 'No one else will be able to join afterwards.',
      buttons: [
        {
          text: 'YES',
          role: 'yes',
          handler: async () => {

            this.db.collection('rooms/').doc(this.id).update({
              started: true
            })

          }
        },
        "No"
      ]
    });
    await alert.present();
  }

  async closeGame(){
    this.db.collection('rooms').doc(this.id).collection('users').ref.onSnapshot(async (users: any) => {
      users.forEach(element => {
        this.db.collection('rooms').doc(this.id).collection('users').doc(element.id).delete().then(ses => {
          this.db.collection('rooms').doc(this.id).delete();
          this.router.navigate(['home']);
        })
      })
    })   
  }

  async exitGame(){
    this.db.collection('rooms').doc(this.id).collection('users').doc(this.myuid).delete();
    this.router.navigate(['home']);
  }

  async kickPlayer(player: any, name: any){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Are you sure?',
      message: 'Do you want to kick ' + name + ' ?',
      buttons: [
        {
          text: 'YES',
          role: 'yes',
          handler: () => {
            this.db.collection('rooms').doc(this.id).collection('users').doc(player).delete();
          }
        },
        "No"
      ]
    });
    await alert.present();
  }

}

