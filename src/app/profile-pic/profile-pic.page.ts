import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { base64ToFile, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { AngularFireStorage } from '@angular/fire/storage'
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-profile-pic',
  templateUrl: './profile-pic.page.html',
  styleUrls: ['./profile-pic.page.scss'],
})
export class ProfilePicPage implements OnInit {
  
  qrUID: any;
  mypfp: any;
  imageChangedEvent: any = '';
  croppedImage: any = '';

  constructor(private _sanitizer: DomSanitizer, private db: AngularFirestore, private afAuth: AngularFireAuth, private afStorage: AngularFireStorage, private modalController: ModalController) { }


  async ngOnInit() {
    this.qrUID = (await this.afAuth.currentUser).uid;

    this.db.collection('users/').doc(this.qrUID).ref.onSnapshot( (snap: any) => {
      this.mypfp = snap.data().pfp;
    })
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event.base64;
  }

  imageLoaded(image: LoadedImage) {
      // show cropper
  }

  cropperReady() {
      // cropper ready
  }

  loadImageFailed() {
      // show message
  }

  async uploadCrop(){

  }

  async cancelCrop(){
    this.imageChangedEvent = '';
    this.croppedImage = '';
  }

  async uploadPic(){
    this.db.collection('users').doc(this.qrUID).update({
      pfp: this.croppedImage
    })
    this.db.collection('users').doc(this.qrUID).collection('friends').ref.get().then(async (friends: any) => {
      friends.forEach(friend => {
        this.db.collection('users').doc(friend.data().uid).collection('friends').doc(this.qrUID).update({
          pfp: this.croppedImage
        })
      });
    }).then(ses => {
      this.modalController.dismiss();
    })
  }

  closeModal(){
    this.modalController.dismiss();
  }
}
