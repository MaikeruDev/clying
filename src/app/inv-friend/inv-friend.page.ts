import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-inv-friend',
  templateUrl: './inv-friend.page.html',
  styleUrls: ['./inv-friend.page.scss'],
})
export class InvFriendPage implements OnInit {

  @Input()
  roomID: any;

  qrUID: any;
  mymail: any;
  myname: any;
  mypfp: any;
  mypoints: any;
  myplayed: any;
  friends: any[] = [];
  joinedPlayers: any[] = [];
  invitedPlayers: any[] = [];

  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth, private modalController: ModalController) { }

  async ngOnInit() {
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
        
        this.db.collection('users').doc(friend.data().uid).collection('invites').ref.where("id", "==", this.roomID).onSnapshot(async (snap: any) => {
          snap.forEach(element => {
            this.invitedPlayers.push(friend.data().uid)
          });
        }) 

        this.db.collection('rooms').doc(this.roomID).collection('users').ref.where("uid", "==", friend.data().uid).onSnapshot(async (joinedUsers: any) => {
          if(!joinedUsers.empty){
            joinedUsers.forEach(joinedUser => {
              this.joinedPlayers.push(joinedUser.data().uid)
            });
          }
        })
      });
    })    
    console.log(this.joinedPlayers)
  }

  async invitePlayer(friend: any){
    this.db.collection('users').doc(friend.uid).collection('invites').doc(this.roomID).set({
      hostname: this.myname,
      id: this.roomID
    })
    this.modalController.dismiss();
  }

}
