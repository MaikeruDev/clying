import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { environment } from '../environments/environment'
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireAuthModule } from '@angular/fire/auth';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { ImageCropperModule } from 'ngx-image-cropper';
import { AngularFireStorageModule } from '@angular/fire/storage'

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [AngularFireStorageModule, ImageCropperModule, NgxQRCodeModule, BrowserModule, IonicModule.forRoot({swipeBackEnabled: false, mode: "md", scrollAssist: true, inputShims: true, scrollPadding: false,}), AppRoutingModule, AngularFireModule.initializeApp(environment.firebaseConfig), AngularFirestoreModule, AngularFireAuthModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
