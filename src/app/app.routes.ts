import { Routes } from '@angular/router';
 
import { FlappyBirdSupervisedComponent } from './pages/flappy-bird-supervised/flappy-bird-supervised.component';
import { ChromeDinoComponent } from './pages/chrome-dino/chrome-dino.component';


export const routes: Routes = [
    { path: "", redirectTo: "flappy-bird-regression-trainning", pathMatch: "full" },
    { path: 'flappy-bird-regression-trainning', component: FlappyBirdSupervisedComponent, title: 'Flappy Bird - (regression trainning)' },
    // { path: 'chrome-dino-regression-trainning', component: ChromeDinoComponent, title: 'Chrome Dino - (regression trainning)' }
]
    ;
