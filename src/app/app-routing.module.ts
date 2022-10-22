import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard'

const redirectUnauthorizedToLogin = () => 
  redirectUnauthorizedTo(['/']);

const redirectLoggedInToHome = () =>
  redirectLoggedInTo(['/home'])

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: 'welcome',
    loadChildren: () => import('./welcome/welcome.module').then( m => m.WelcomePageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'reset-pw',
    loadChildren: () => import('./reset-pw/reset-pw.module').then( m => m.ResetPwPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'add-friends',
    loadChildren: () => import('./add-friends/add-friends.module').then( m => m.AddFriendsPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'lobby',
    loadChildren: () => import('./lobby/lobby.module').then( m => m.LobbyPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'profile-pic',
    loadChildren: () => import('./profile-pic/profile-pic.module').then( m => m.ProfilePicPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'achievements',
    loadChildren: () => import('./achievements/achievements.module').then( m => m.AchievementsPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then( m => m.UserPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'inv-friend',
    loadChildren: () => import('./inv-friend/inv-friend.module').then( m => m.InvFriendPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'running-game',
    loadChildren: () => import('./running-game/running-game.module').then( m => m.RunningGamePageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'voting',
    loadChildren: () => import('./voting/voting.module').then( m => m.VotingPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'winner',
    loadChildren: () => import('./winner/winner.module').then( m => m.WinnerPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
