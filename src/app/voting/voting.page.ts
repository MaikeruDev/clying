import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-voting',
  templateUrl: './voting.page.html',
  styleUrls: ['./voting.page.scss'],
})
export class VotingPage implements OnInit {

  myuid: any;
  qrUID: any;
  mymail: any;
  myname: any;
  mypfp: any;
  myvoted: any;

  id: any;
  host: any;
  hostpfp: any;
  hostUID: any;
  
  clyer: any;
  clyerUID: any;
  clyerName: any;
  clyerPfp: any;
  clyerMail: any;

  roundNum: any = 0;
  isClyer: any;

  players: any[] = []
  playersNotMe: any[] = []

  recievedVotes: any;
  totalVotes: any;

  voted: any = false;
  voteCheckPlayers: any[] = [];

  voteOut: any;
  voteOutPfp: any;
  voteOutUID: any;
  noVoteOut: any;

  winner: any;

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

        this.db.collection('rooms/').doc(this.id).ref.onSnapshot(async (snap: any) => {
          //If Room Exists
          if(snap.data()){

            //Get Round
            this.roundNum = snap.data().round;

            //Get Host Data
            this.db.collection('users').doc(snap.data().host).ref.onSnapshot(async (user: any) => {
              this.host = user.data().name;
              this.hostpfp = user.data().pfp;
              this.hostUID = user.id;
            });

            this.db.collection('rooms').doc(this.id).collection('users').doc(this.myuid).ref.onSnapshot(async (snapp: any) => {
              this.myvoted = snapp.data().voted;
            })

            //Is user in this round?
            this.db.collection('rooms').doc(this.id).collection('users').ref.where("uid", "==", this.myuid).get().then(async (snap: any) => {
              if(snap.empty){
                this.BackToHome();
              }
            })

            this.db.collection('rooms').doc(this.id).collection('users').doc(this.myuid).ref.onSnapshot(async (snap: any) => {
              this.voted = snap.data().voted;
            })

            this.db.collection('rooms').doc(this.id).collection('clyer').doc('round' + this.roundNum).ref.get().then(async (doc: any) => {
              this.clyerUID = doc.data().uid
            })
            
            //Get Players
            this.db.collection('rooms').doc(this.id).collection('users').ref.onSnapshot(async (users: any) => {
              this.players = [];
              this.playersNotMe = [];
              this.voteCheckPlayers = [];

              //Set Total Votes
              this.totalVotes = users.size;
              this.voteCheckPlayers.sort((a, b) => (a.votes < b.votes) ? 1 : -1)

              this.db.collection('rooms').doc(this.id).ref.onSnapshot(async (susss: any) => {
                this.voteCheckPlayers.sort((a, b) => (a.votes < b.votes) ? 1 : -1)
                this.recievedVotes = susss.data().votes;
                if(this.recievedVotes == this.totalVotes){
                  if(this.voteCheckPlayers[0].votes == this.voteCheckPlayers[1].votes){
                    this.noVoteOut = true;
                    this.winner = "Nobody";
                    await this.delay(5000)
                    let navigationExtras: NavigationExtras = {
                      queryParams: {
                        id: JSON.stringify(this.id),
                        winner: JSON.stringify(this.winner)
                      }
                    };
                    this.router.navigate(['winner'], navigationExtras);
                  }
                  else{
                    this.noVoteOut = false;
                    this.voteOut = this.voteCheckPlayers[0].name
                    this.voteOutUID = this.voteCheckPlayers[0].uid
                    this.voteOutPfp = this.voteCheckPlayers[0].pfp

                    if(this.voteOutUID == this.clyerUID){
                      this.winner = "nClyer";
                      await this.delay(5000)
                      let navigationExtras: NavigationExtras = {
                        queryParams: {
                          id: JSON.stringify(this.id),
                          winner: JSON.stringify(this.winner)
                        }
                      };
                      this.router.navigate(['winner'], navigationExtras);
                    }
                    else{
                      this.winner = "Clyer";
                      await this.delay(5000)
                      let navigationExtras: NavigationExtras = {
                        queryParams: {
                          id: JSON.stringify(this.id),
                          winner: JSON.stringify(this.winner)
                        }
                      };
                      this.router.navigate(['winner'], navigationExtras);
                    }

                  }
                }
              })

              users.forEach(async element => {
               await this.players.push(element.data())
               if(element.data().uid != this.myuid){
                 await this.playersNotMe.push(element.data())
               }
               await this.voteCheckPlayers.push(element.data())
              this.voteCheckPlayers.sort((a, b) => (a.votes < b.votes) ? 1 : -1)
              this.voteOut = this.voteCheckPlayers[0].name
              this.voteOutUID = this.voteCheckPlayers[0].uid
              this.voteOutPfp = this.voteCheckPlayers[0].pfp
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

  async vote(player: any){
    this.db.collection('rooms').doc(this.id).collection('users').doc(this.myuid).update({
      voted: true
    })
    this.db.collection('rooms').doc(this.id).collection('users').doc(player).ref.get().then(async (doc: any) => {
      const votes = doc.data().votes + 1;
      this.db.collection('rooms').doc(this.id).collection('users').doc(player).update({
        votes: votes
      })
    })
    this.recievedVotes++;
    if(this.recievedVotes == this.totalVotes){
      this.db.collection('rooms').doc(this.id).update({
        votes: this.recievedVotes
      })
      this.voteCheckPlayers.sort((a, b) => (a.votes < b.votes) ? 1 : -1)
      if(this.voteCheckPlayers[0].votes == this.voteCheckPlayers[1].votes){
        this.noVoteOut = true;
      }
      else{
        this.noVoteOut = false;
        this.voteOut = this.voteCheckPlayers[0].name
        this.voteOutUID = this.voteCheckPlayers[0].uid
        this.voteOutPfp = this.voteCheckPlayers[0].pfp
      }
    }
    else{
      this.db.collection('rooms').doc(this.id).update({
        votes: this.recievedVotes
      })
    }
    /* if(this.recievedVotes > this.totalVotes){
      this.voteCheckPlayers.sort((a, b) => (a.votes > b.votes) ? 1 : -1)
      console.log(this.voteCheckPlayers)
      this.voteOut = this.voteCheckPlayers[0].name
      this.voteOutUID = this.voteCheckPlayers[0].uid
      this.voteOutPfp = this.voteCheckPlayers[0].pfp
    }
    else{
      this.db.collection('rooms').doc(this.id).update({
        votes: this.recievedVotes
      })
    } */
  }

  async BackToHome(){
    this.router.navigate(['home']);
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

}
