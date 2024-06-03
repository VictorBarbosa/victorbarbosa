import { Component } from '@angular/core';
import { TensorflowVisSampleComponent } from '../tensorflow-visualization/tensorflow-visualization.component';
import { CommonModule } from '@angular/common';
enum Action {
  Nothing = 0,
  Jump = 1
}
interface Data {
  xTarget: number,
  xAgent: number
  action: Action
}
@Component({
  selector: 'app-flappy-bird-supervised',
  standalone: true,
  imports: [CommonModule, TensorflowVisSampleComponent],
  templateUrl: './flappy-bird-supervised.component.html',
  styleUrl: './flappy-bird-supervised.component.scss'
})
export class FlappyBirdSupervisedComponent {
  readonly screenYSize !: number
  data: Data[] = [];
  inputs:number[][] = []
  labels: number[];
 
  constructor() {
    this.screenYSize = window.innerHeight;
    const json = this.creatingDataToTraining();

    this.inputs = this.data.map(d => [d.xAgent, d.xTarget]);
    this.labels = this.data.map(d => Number(d.action));
    debugger
  }


  creatingDataToTraining() {
    for (let target = 0; target < this.screenYSize; target+=10) {
      for (let agent = 0; agent < this.screenYSize; agent+=10) {
        if (agent < target) {
          this.data.push({ xAgent: agent, xTarget: target, action: Action.Nothing })
        } else {
          this.data.push({ xAgent: agent, xTarget: target, action: Action.Jump })
        }
      }
    }


    return JSON.stringify(this.data)
  }


}
