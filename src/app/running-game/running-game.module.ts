import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RunningGamePageRoutingModule } from './running-game-routing.module';

import { RunningGamePage } from './running-game.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RunningGamePageRoutingModule
  ],
  declarations: [RunningGamePage]
})
export class RunningGamePageModule {}
