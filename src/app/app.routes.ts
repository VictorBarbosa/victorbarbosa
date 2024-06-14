import { Routes } from '@angular/router';

import { FlappyBirdSupervisedComponent } from './pages/flappy-bird-supervised/flappy-bird-supervised.component';
import { StarShipLandingSuperVizedComponent } from './pages/starship-landing-super-vized/starship-landing-super-vized.component';
import { SeesawComponent } from './pages/seesaw/seesaw.component';



export const routes: Routes = [
    { path: "", redirectTo: "seesaw-regression-trainning", pathMatch: "full" },
    // { path: "", redirectTo: "flappy-bird-regression-trainning", pathMatch: "full" },
    { path: 'flappy-bird-regression-trainning', component: FlappyBirdSupervisedComponent, title: 'Flappy Bird - (regression trainning)' },
    { path: 'seesaw-regression-trainning', component: SeesawComponent, title: 'Seesaw - (regression trainning)' },
     { path: 'starship-landing-regression-trainning', component: StarShipLandingSuperVizedComponent, title: 'Starship Landing - (regression trainning)' },
    // { path: 'chrome-dino-regression-trainning', component: ChromeDinoComponent, title: 'Chrome Dino - (regression trainning)' }
]
    ;
