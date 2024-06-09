import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import * as tfvis from '@tensorflow/tfjs-vis';
import * as tf from '@tensorflow/tfjs';

import { BehaviorSubject, distinctUntilChanged, shareReplay, tap } from 'rxjs';
import { TensorflowSettings } from '../../common/tensorflow-settings';

@Component({
  selector: 'app-tensorflow-visualization',
  standalone: true,
  templateUrl: './tensorflow-visualization.component.html',
  styleUrl: './tensorflow-visualization.component.scss'
})
export class TensorflowVisSampleComponent implements AfterViewInit, OnDestroy {

  @ViewChild('vis', { static: true }) container!: ElementRef<HTMLDivElement>;
  @Output("modelTrainned") modelTrainned: EventEmitter<tf.Sequential> = new EventEmitter();

  private readonly _tensorflowSettings = new BehaviorSubject<TensorflowSettings | null>(null);
  private _settingsValue: TensorflowSettings | null = null;

  @Input() set settings(value: TensorflowSettings | null) {
    if (this._settingsValue !== value) {
      this._settingsValue = value;
      this._tensorflowSettings.next(value);
    }
  }

  model!: tf.Sequential;

  constructor() { }

  ngAfterViewInit(): void {
    this._tensorflowSettings.pipe(
      tap(async (settings) => {
        if (settings && this.container && this.container.nativeElement) {
          await this.initializeModel(settings);
        }
      })
    ).subscribe();
  }

  async initializeModel(settings: TensorflowSettings) {
    await tf.ready();
 
    const { inputs, labels, mainLayers, finalLayer } = settings;
    
    // Dividir os dados em treinamento e teste
    const splitIndex = Math.floor(inputs.length * 0.9);
    const trainInputs = inputs.slice(0, splitIndex);
    const testInputs = inputs.slice(splitIndex);
    const trainLabels = labels.slice(0, splitIndex);
    const testLabels = labels.slice(splitIndex);

    const inputTensor = tf.tensor(trainInputs);
    const testInputTensor = tf.tensor(testInputs);
    const labelTensor = tf.tensor(trainLabels);
    const testLabelTensor = tf.tensor(testLabels);

    // Definir o modelo
    this.model = tf.sequential();

    // Adicionar camadas ao modelo
    mainLayers.forEach(layer => this.model.add(layer));
    this.model.add(finalLayer);

    // Compilar o modelo
    this.model.compile(settings.compiler);

    // Callback de treinamento
    const surface = { name: 'show.fitCallbacks', tab: 'Training', drawArea: this.container.nativeElement };
    const trainingCompleteCallback = {
      onTrainEnd: () => {
        this.modelTrainned.emit(this.model);
      }
    };

    // Treinar o modelo dentro de tf.tidy()
    await tf.tidy(() => {
      this.model.fit(inputTensor, labelTensor, {
        ...settings.fit,
        validationData: [testInputTensor, testLabelTensor], // Adicionando dados de validação
        callbacks: [tfvis.show.fitCallbacks(surface, ['loss', 'acc']), trainingCompleteCallback],
      });
    });
  }

  ngOnDestroy(): void {
    this.modelTrainned.complete();
    this.modelTrainned.unsubscribe();
    this._tensorflowSettings.complete();
    this._tensorflowSettings.unsubscribe();
  }
}
