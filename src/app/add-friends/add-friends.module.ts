import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddFriendsPageRoutingModule } from './add-friends-routing.module';

import { AddFriendsPage } from './add-friends.page';

import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddFriendsPageRoutingModule,
    NgxQRCodeModule,
		ZXingScannerModule
  ],
  declarations: [AddFriendsPage]
})
export class AddFriendsPageModule {}
