import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as tfvis from '@tensorflow/tfjs-vis';
import * as tf from '@tensorflow/tfjs'

import { BehaviorSubject, distinctUntilChanged, shareReplay, tap } from 'rxjs';
import { TensorflowSettings } from '../../common/tensorflow-settings';


@Component({
  selector: 'app-tensorflow-visualization',
  standalone: true,
  imports: [],
  templateUrl: './tensorflow-visualization.component.html',
  styleUrl: './tensorflow-visualization.component.scss'
})
export class TensorflowVisSampleComponent {

  @ViewChild('vis', { static: true }) container!: ElementRef<HTMLDivElement>

  @Output("modelTrainned") modelTrainned: EventEmitter<tf.Sequential> = new EventEmitter()


  /*
   * TensorflowSettings
   */
  private readonly _tensorflowSettings = new BehaviorSubject<TensorflowSettings | null>(null);
  settings$ = this._tensorflowSettings.asObservable().pipe(distinctUntilChanged(), shareReplay({ bufferSize: 1, refCount: true }));

  /*
  * TensorflowSettings getter
  */
  get settings(): TensorflowSettings | null {
    return this._tensorflowSettings.getValue();
  }

  /*
   * TensorflowSettings setter
   */
  @Input() set settings(value: TensorflowSettings | null) {
    if (this._tensorflowSettings.getValue() !== value) {
      this._tensorflowSettings.next(value);
    }
  }

  model!: tf.Sequential

  constructor() {
    this.settings$.pipe(tap(async (settings) => {
      if (settings) {
 
        const { inputs, labels, mainLayers, finalLayer } = settings;
        const inputTensor = tf.tensor2d(inputs, [inputs.length, 2], 'float32');
        const labelTensor = tf.tensor1d(labels);

        // Definir o modelo
        this.model = tf.sequential();

        /**
         * Adding first and hidden layers
         */
        mainLayers.forEach(layer => this.model.add(layer));

        /**
         * Output layer
         */
        this.model.add(finalLayer);


        this.model.compile(settings.compiler)

        this.model.compile({
          optimizer: tf.train.adam(),
          loss: 'sparseCategoricalCrossentropy', // Usar sparseCategoricalCrossentropy para classificação multiclasse
          metrics: ['accuracy']
        });

        const surface = { name: 'show.fitCallbacks', tab: 'Training', drawArea: this.container?.nativeElement };

        const trainingCompleteCallback = {
          onTrainEnd: () => {
            alert('Training complete!');
            this.modelTrainned.emit(this.model)
          }
        };

        const fit = {
          ...settings.fit,
          callbacks: [tfvis.show.fitCallbacks(surface, ['loss', 'acc']), trainingCompleteCallback],
        }
 
        await this.model.fit(inputTensor, labelTensor, fit);
      }
    })).subscribe();
  }
}


