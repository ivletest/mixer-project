import { Component, OnInit, Input, ViewChild, HostBinding, ElementRef } from '@angular/core';
import { AudioService } from './../../services/audio.service';
import { VisualsService } from '../../services/visuals.service';
import { Track } from './../../track.interface';


@Component({
  selector: 'app-deck-common',
  templateUrl: './deck-common.component.html',
  styleUrls: ['./deck-common.component.css'],
  providers: [AudioService, VisualsService]
})
export class DeckCommonComponent implements OnInit
{
  @Input() deck: string;

  @Input() set volume(value: number) { this.Connect('gain', value); }
  @Input() set eqHi(value: number) { this.Connect('eqHi', value); }
  @Input() set eqMid(value: number) { this.Connect('eqMid', value); }
  @Input() set eqLo(value: number) { this.Connect('eqLo', value); }

  @HostBinding('class') classes = 'col-xl-5 col-md-8';
  @ViewChild('canvas') canvasRef: ElementRef;

  // ___________________________________________________Indicators
  private _timer: any;
  private _soundWaveCanvas: HTMLCanvasElement;
  public duration: number;
  public currentTime: number;
  public trackInfo: Track;
  public playState: boolean;

  private onFileLoaded(audioData: AudioBuffer)
  {
    this.duration = this.audioService.audioDuration;
    this.visualsService.renderWaveForm(audioData, this._soundWaveCanvas);
  }

  private Play(): void
  {
    this.audioService.StartAudio();
    this.StartTimer();
    this.playState = !this.playState;
  }

  private Stop(): void
  {
    this.audioService.StopAudio();
    this.StopTimer();
    this.playState = !this.playState;
  }

  private StartTimer(): void
  {
    this._timer = setInterval(() => this.currentTime = this.audioService.contextTimer, 1000);
  }

  private StopTimer(): void
  {
    clearInterval(this._timer);
    this._timer = null;
  }

  private onSpeedChange(value: number)
  {
    this.audioService.detune = value;
    this.duration = this.audioService.audioDuration * ((value - 1) * -1 + 1);
  }

  private Connect(destination: string, value: number)
  {
    try
    {
      this.audioService[destination] = value;
    } catch
    {
      console.log('No Audio Context To Connect To');
    }
  }

  constructor(
    private audioService: AudioService,
    private visualsService: VisualsService)
  {

  }

  ngOnInit()
  {
    this.trackInfo = {
      title: 'Song Title',
      artist: 'Artist',
      album: 'Album',
      year: '2018',
      duration: 240,
      albumCover: 'assets/img/album-art-placeholder.png'
    };
    this._timer = null;
    this.currentTime = 0;
    this.duration = 0;
    this.playState = false;
    this._soundWaveCanvas = this.canvasRef.nativeElement;
    this.audioService.decodedAudioEmitter
      .subscribe(audioData => this.onFileLoaded(audioData));
  }
}