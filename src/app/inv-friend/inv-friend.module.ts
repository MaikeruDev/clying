import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InvFriendPageRoutingModule } from './inv-friend-routing.module';

import { InvFriendPage } from './inv-friend.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InvFriendPageRoutingModule
  ],
  declarations: [InvFriendPage]
})
export class InvFriendPageModule {}
