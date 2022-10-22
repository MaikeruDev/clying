import { Component, HostListener, OnDestroy, OnInit, VERSION } from '@angular/core';
import { AngularFireAuth, AngularFireAuthModule } from '@angular/fire/auth';
import { AuthenticationService } from '../services/authentication.service';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { AddFriendsPage } from '../add-friends/add-friends.page';
import { AlertController, LoadingController, ModalController, Platform, ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { NavigationExtras, Router } from '@angular/router';
import { ProfilePicPage } from '../profile-pic/profile-pic.page';
import { AchievementsPage } from '../achievements/achievements.page';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  slideOpts = {
    initialSlide: 1,
    speed: 700, 
  };

  elementType = NgxQrcodeElementTypes.CANVAS;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  qrUID: any;
  friends: any[] = [];
  joinID: any;
  uid: any;
  addMail: any;
  mymail: any;
  myname: any;
  myplayed: any;
  mypfp: any;
  mypoints: any;
  achievementsTotal: any;
  achievementsReached: any;

  constructor(public platform: Platform, private toastController: ToastController, private loadingController: LoadingController, private authService: AuthenticationService, private afAuth: AngularFireAuth, private modalController: ModalController, private db: AngularFirestore, private alertController: AlertController, private router: Router) {}

  async Share(){
    await Share.share({
      title: 'ClyingWeb',
      text: 'Check out this awesome Game!',
      url: 'https://clyingweb.web.app/',
      dialogTitle: 'Share with your buddies',
    });
  }

  async ngOnInit(){
    
    this.qrUID = (await this.afAuth.currentUser).uid;
    this.mymail = (await this.afAuth.currentUser).email;
    this.myname = (await this.afAuth.currentUser).displayName;

    this.db.collection('users/').doc(this.qrUID).ref.onSnapshot( (snap: any) => {
      this.mypfp = snap.data().pfp;
      this.mypoints = snap.data().points;
      this.myplayed = snap.data().played;
    })

    this.db.collection('users/').doc(this.qrUID).collection('friends').ref.onSnapshot( (snap: any) => {
      this.friends = [];
      snap.forEach(friend => {
        this.friends.push(friend.data());
      });

    })

    const achievements = this.db.collection('users').doc(this.qrUID).collection('achievements');

    achievements.ref.onSnapshot(async (snap: any) => {
      this.achievementsTotal = snap.size;
    })
    
    achievements.ref.where("achieved", "==", true).onSnapshot(async (doc: any) => {
      this.achievementsReached = doc.size;
    })

    this.db.collection('rooms/').ref.get().then(async (snap: any) => {
      snap.forEach(async (element: any) => {
        this.db.collection('rooms/').doc(element.id).collection('users').ref.where("uid", "==", this.qrUID).get().then(async (onSnap: any) => {
          if(!onSnap.empty){
            const alert = await this.alertController.create({
              cssClass: 'my-custom-class',
              header: 'You are in a running Session',
              message: 'We will now move you back into your game!',
              buttons: [
                {
                  text: 'OK',
                  role: 'okay',
                  handler: () => {
                    let navigationExtras: NavigationExtras = {
                      queryParams: {
                        id: JSON.stringify(element.id)
                      }
                    };
                    this.router.navigate(['lobby'], navigationExtras);
                  }
                }
              ],
              backdropDismiss: false
            });
            await alert.present();
          }
        })
      });
    })


    this.db.collection('users').doc(this.qrUID).collection('invites').ref.onSnapshot(async (invites: any) => {
      invites.forEach(async (invite: any) => {
        await Haptics.vibrate;
        const toast = await this.toastController.create({
          header: 'You have been invited by ' + invite.data().hostname,
          position: 'top',
          cssClass: "toast-custom-class",
          buttons: [
            {
              text: 'Accept',
              handler: () => {
                this.db.collection('users').doc(this.qrUID).collection('invites').doc(invite.id).delete();
                this.db.collection('rooms/').doc(invite.id).collection('users').doc(this.qrUID).set({
                  email: this.mymail,
                  name: this.myname,
                  pfp: this.mypfp,
                  uid: this.qrUID,
                  voted: false,
                  votes: 0,
                  points: 0
                }).then(ses => {
                  let navigationExtras: NavigationExtras = {
                    queryParams: {
                      id: JSON.stringify(invite.id)
                    }
                  };
                  this.router.navigate(['lobby'], navigationExtras);
                })
              }
            }, {
              text: 'Deny',
              role: 'cancel',
              handler: () => {
                this.db.collection('users').doc(this.qrUID).collection('invites').doc(invite.id).delete();
              }
            }
          ]
        });
        await toast.present();
      });
    })
  }

  async openAddFriends(){
    const modal = await this.modalController.create({
      component: AddFriendsPage
    });

    return await modal.present();
  }

  async openFriendProfile(userID){
    let navigationExtras: NavigationExtras = {
      queryParams: {
        id: JSON.stringify(userID)
      }
    };
    this.router.navigate(['user'], navigationExtras);
  }

  async makeRandom(lengthOfCode: number, possible: string) {
    let text = "";
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
      return text;
  }

  makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

  async hostGame(){
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Creating Game...',
      duration: 500,
      backdropDismiss: false
    });
    await loading.present();
    const roomID = this.makeid();
    this.db.collection('rooms/').ref.where("id", "==", roomID).get().then(async (snap: any) => {
      if(snap.empty){
        this.db.collection('rooms/').doc(roomID).set({
          host: this.qrUID,
          id: roomID,
          started: false,
          clyer: "",
          clyerSet: false,
          round: 1,
          talkingPlayer: 0,
          done: false,
          votingActive: false,
          votes: 0,
          opened: new Date()
        }).then(ses => {
          let navigationExtras: NavigationExtras = {
            queryParams: {
              id: JSON.stringify(roomID.toUpperCase())
            }
          };
           this.router.navigate(['lobby'], navigationExtras);
        })
      }
    })

    this.db.collection('rooms/').doc(roomID).collection('users').doc(this.qrUID).set({
      email: this.mymail,
      name: this.myname,
      pfp: this.mypfp,
      uid: this.qrUID,
      voted: false,
      votes: 0,
      points: 0
    }) 
}

  async joinGame(){
    const monke = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Searching Game...',
      duration: 300,
      backdropDismiss: false
    });
    await monke.present().finally();

    this.db.collection('rooms/').ref.where("id", "==", this.joinID.toUpperCase()).get().then(async (snap: any) =>{
      if(snap.empty){
        const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header: 'Fail',
          subHeader: 'Room not found!',
          message: 'We could not find a room with the ID you entered!',
          buttons: ['OK']
        });
    
        await alert.present();
      }
      else{

        this.db.collection('rooms/').doc(this.joinID.toUpperCase()).collection('users').ref.get().then(async (snap: any) => {
          if(snap.size >= 10){
            const alert = await this.alertController.create({
              cssClass: 'my-custom-class',
              header: 'Fail',
              subHeader: 'Room is full!',
              message: 'The room with the ID you entered, is already full!',
              buttons: ['OK']
            });
        
            await alert.present();
          }
          else{
            this.db.collection('rooms/').doc(this.joinID.toUpperCase()).ref.get().then(async (snap: any) => {
              if(snap.data().started == true){
                const alert = await this.alertController.create({
                  cssClass: 'my-custom-class',
                  header: 'Fail',
                  subHeader: 'Game has already started!',
                  message: 'The game with the ID you entered, has already started!',
                  buttons: ['OK']
                });
                
                await alert.present();
              }
              else{
                const loading = await this.loadingController.create({
                  cssClass: 'my-custom-class',
                  message: 'Joining Game...',
                  duration: 400,
                  backdropDismiss: false
                });

                await loading.present().then();
                this.db.collection('rooms/').doc(this.joinID.toUpperCase()).collection('users').doc(this.qrUID).set({
                  uid: this.qrUID,
                  voted: false,
                  points: 0,
                  votes: 0,
                  email: this.mymail,
                  name: this.myname,
                  pfp: this.mypfp,
                }).then(ses => {
                  let navigationExtras: NavigationExtras = {
                    queryParams: {
                      id: JSON.stringify(this.joinID.toUpperCase())
                    }
                  };
                   this.router.navigate(['lobby'], navigationExtras);
                })  
              }
            })            
          }
        })
      }
    })
  }

  async deleteFriend(uidF: any, friend: any){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Are you sure?',
      message: 'You are about to remove ' + friend + ' from your friend list.',
      buttons: [
        {
          text: 'YES',
          role: 'yes',
          handler: async () => {
            this.db.collection('users').doc(uidF).collection('friends').doc(this.qrUID).delete();
            this.db.collection('users').doc(this.qrUID).collection('friends').doc(uidF).delete();
          }
        },
        "NO"
      ]
    });
    await alert.present();
  }

  async openPfp(){
    const modal = await this.modalController.create({
      component: ProfilePicPage,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  async openAchievements(){
    const modal = await this.modalController.create({
      component: AchievementsPage,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  async signOut(){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Are you sure?',
      message: 'You are about to log out!',
      buttons: [
        {
          text: 'YES',
          role: 'yes',
          handler: async () => {
            const loading = await this.loadingController.create({
              cssClass: 'my-custom-class',
              message: 'We will miss you :(',
              duration: 1000,
              backdropDismiss: false
            });

            await loading.present();
            await this.delay(1000);
            this.authService.signOut();
          }
        },
        "NO"
      ]
    });
    await alert.present();
  }
}
