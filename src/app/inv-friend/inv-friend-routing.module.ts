import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InvFriendPage } from './inv-friend.page';

const routes: Routes = [
  {
    path: '',
    component: InvFriendPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvFriendPageRoutingModule {}
