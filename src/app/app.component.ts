import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSidenavModule} from '@angular/material/sidenav';

import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,MatSidenavModule, MatFormFieldModule, MatSelectModule, MatButtonModule,
    MatButtonModule, MatMenuModule, MatIconModule

  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
 
})
export class AppComponent {
  title = 'victorbarbosa';
}
