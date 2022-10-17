import { Component, ViewChild } from '@angular/core';
import Cropper from 'cropperjs';
import { timer } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('image') image!: HTMLImageElement;
  @ViewChild('buttonConfirm') buttonConfirm?: HTMLButtonElement;

  public cropper?: Cropper;
  public showButtonConfirm: boolean;
  public cursorPosition = {
    x: 0,
    y: 0
  };

  constructor() {
    this.showButtonConfirm = false;
  }

  public enableCrop(): void {
    if (this.cropper) return;
    this.cropper = new Cropper((this.image as any).nativeElement, {
      viewMode: 1,
      preview: '.visualizer',
      background: true,
      autoCropArea: 0.1,
      autoCrop: false,
      cropstart: () => {
        this.showButtonConfirm = false;
      },
      cropend: () => {
        this.showButtonConfirm = true;
        const rightBottomDot = document.getElementsByClassName(
          'cropper-point point-se'
        )[0];

        timer(10).subscribe(() => {
          const button = document.getElementById('btn-confirm');
          if (!button) return;
          button.style.top = `${
            rightBottomDot.getBoundingClientRect().top + 5
          }px`;
          button.style.left = `${
            rightBottomDot.getBoundingClientRect().left +
            5 -
            button.getBoundingClientRect().width
          }px`;
        });
      }
    });
  }

  public actions(action: string): void {
    if (!this.cropper) return;
    switch (action) {
      case 'move':
      case 'crop':
        this.cropper.setDragMode(action);
        break;
      case 'zoom-in':
        this.cropper.zoom(0.1);
        break;
      case 'zoom-out':
        this.cropper.zoom(-0.1);
        break;
      case 'rotate-left':
        this.cropper.rotate(-90);
        break;
      case 'rotate-right':
        this.cropper.rotate(90);
        break;
      case 'flip-horizontal':
        this.cropper.scaleX(-this.cropper.getData().scaleX || -1);
        break;
      case 'flip-vertical':
        this.cropper.scaleY(-this.cropper.getData().scaleY || -1);
        break;
    }
  }

  public disableCrop(): void {
    this.cropper?.destroy();
    this.cropper = undefined;
    this.showButtonConfirm = false;
  }

  public getRoundedCanvas(sourceCanvas: any) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;

    canvas.width = width;
    canvas.height = height;
    context!.imageSmoothingEnabled = true;
    context!.drawImage(sourceCanvas, 0, 0, width, height);
    context!.globalCompositeOperation = 'destination-in';
    context!.fill();
    return canvas;
  }

  public confirmCrop(): void {
    const result = document.getElementById('result');
    // Crop
    const croppedCanvas = this.cropper!.getCroppedCanvas();

    // Round
    const roundedCanvas = this.getRoundedCanvas(croppedCanvas);
    // Show
    const roundedImage = document.createElement('img');
    roundedImage.src = roundedCanvas.toDataURL();

    result!.innerHTML = '';
    result!.appendChild(roundedImage);

    // const base64 = roundedCanvas.toDataURL('image/jpeg').split(';base64,')[1];
    // console.log('base64: ', base64);
    console.log('base64: ', roundedImage.src);
  }
}
