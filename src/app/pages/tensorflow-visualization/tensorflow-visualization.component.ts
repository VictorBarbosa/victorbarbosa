import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as tfvis from '@tensorflow/tfjs-vis';
import * as tf from '@tensorflow/tfjs'
import { BehaviorSubject, combineLatest, distinctUntilChanged, shareReplay, tap } from 'rxjs';

@Component({
  selector: 'app-tensorflow-visualization',
  standalone: true,
  imports: [],
  templateUrl: './tensorflow-visualization.component.html',
  styleUrl: './tensorflow-visualization.component.scss'
})
export class TensorflowVisSampleComponent {

  @ViewChild('vis', { static: true }) container!: ElementRef<HTMLDivElement>


  /*
   * inputs
   */
  private readonly _inputs = new BehaviorSubject<number[][] | null>(null);
  inputs$ = this._inputs.asObservable().pipe(distinctUntilChanged(), shareReplay({ bufferSize: 1, refCount: true }));

  /*
  * inputs getter
  */
  get inputs(): number[][] | null {
    return this._inputs.getValue();
  }

  /*
   * inputs setter
   */
  @Input() set inputs(value: number[][] | null) {
    if (this._inputs.getValue() !== value) {
      this._inputs.next(value);
    }
  }
  /*
   * Labels
   */
  private readonly _labels = new BehaviorSubject<number[] | null>(null);
  labels$ = this._labels.asObservable().pipe(distinctUntilChanged(), shareReplay({ bufferSize: 1, refCount: true }));

  /*
  * Labels getter
  */
  get labels(): number[] | null {
    return this._labels.getValue();
  }

  /*
   * Labels setter
   */
  @Input() set labels(value: number[] | null) {
    if (this._labels.getValue() !== value) {
      this._labels.next(value);
    }
  }



  model!: tf.Sequential

  constructor() {
    combineLatest([this.inputs$, this.labels$]).pipe(tap(async ([inputs, labels]: any) => {
      if (this.container?.nativeElement && inputs && labels) {

        const inputTensor = tf.tensor2d(inputs, [inputs.length, 2], 'float32');
        const labelTensor = tf.tensor1d(labels,);

        // Definir o modelo
        this.model = tf.sequential();
        this.model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [2] }));
        this.model.add(tf.layers.dense({ units: 2, activation: 'softmax' })); // 2 ações possíveis

        this.model.compile({
          optimizer: tf.train.adam(),
          loss: 'sparseCategoricalCrossentropy', // Usar sparseCategoricalCrossentropy para classificação multiclasse
          metrics: ['accuracy']
        });


        const surface = { name: 'show.fitCallbacks', tab: 'Training', drawArea: this.container?.nativeElement };

        debugger

        const trainingCompleteCallback = {
          onTrainEnd: () => {
            alert('Training complete!');
          }
        };

        // Train for 5 epochs with batch size of 32.
        await this.model.fit(inputTensor, labelTensor, {
          epochs: 25,
          batchSize: 128,
          callbacks: [tfvis.show.fitCallbacks(surface, ['loss', 'acc']), trainingCompleteCallback],
        });
      }
    })).subscribe()
  }

  predict(xAgent: number, xTarget: number) {
    // this.model.predict({})
  }

}


