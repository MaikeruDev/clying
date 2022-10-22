import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfilePicPage } from './profile-pic.page';

const routes: Routes = [
  {
    path: '',
    component: ProfilePicPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePicPageRoutingModule {}
