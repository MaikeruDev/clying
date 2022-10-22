import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {

  userid: any;
  username: any;
  usermail: any;
  userpfp: any;
  userpoints: any;
  userplayed: any;
  userfriends: any[] = [];
  achievementsTotal: any;
  achievementsReached: any;
  
  constructor(private route : ActivatedRoute, private router : Router, private db: AngularFirestore, public afAuth: AngularFireAuth, private toastController: ToastController, private alertController: AlertController){}

  async ngOnInit() {

    this.route.queryParams.subscribe(async params => {
      if (params && params.id) {
        this.userid = JSON.parse(params.id);
        
        this.db.collection('users/').doc(this.userid).ref.onSnapshot(async (snap: any) => {
          if(snap.data()){
            this.username = snap.data().name;
            this.usermail = snap.data().email;
            this.userpfp = snap.data().pfp;
            this.userpoints = snap.data().points;
            this.userplayed = snap.data().played;

            this.db.collection('users/').doc(this.userid).collection('friends').ref.onSnapshot( (snap: any) => {
              this.userfriends = [];
              snap.forEach(friend => {
                this.userfriends.push(friend.data());
              });
            })

            const achievements = this.db.collection('users').doc(this.userid).collection('achievements');

            achievements.ref.onSnapshot(async (snap: any) => {
              this.achievementsTotal = snap.size;
            })
            
            achievements.ref.where("achieved", "==", true).onSnapshot(async (doc: any) => {
              this.achievementsReached = doc.size;
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
  
  async BackToHome(){
    this.router.navigate(['home']);
  }

}
