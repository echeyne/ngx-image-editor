import { Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatAutocompleteModule, MatButtonModule, MatButtonToggleModule, MatIconModule, MatInputModule, MatMenuModule, MatProgressSpinnerModule, MatSliderModule, MatDialogModule, MatTabsModule, MatTooltipModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class NgxImageEditorComponent {
    constructor() {
        this.file = new EventEmitter();
        this.zoomIn = 0;
        this.sliderValue = 0;
        this.loading = true;
        this.canvasFillColor = '#fff';
        this.state = new EditorOptions();
    }
    /**
     * @param {?} config
     * @return {?}
     */
    set config(config) {
        this.state = config;
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.handleStateConfig();
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.cropper.destroy();
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        // NOTE if we don't have a file meaning that loading the image will happen synchronously we can safely
        // call initializeCropper in ngAfterViewInit. otherwise if we are using the FileReader to load a base64 image
        // we need to call onloadend asynchronously..
        if (!this.state.File && this.state.ImageUrl) {
            this.initializeCropper();
        }
    }
    /**
     * @return {?}
     */
    handleStateConfig() {
        this.state.ImageType = this.state.ImageType ? this.state.ImageType : 'image/jpeg';
        if (this.state.ImageUrl) {
            this.state.File = null;
            this.previewImageURL = this.state.ImageUrl;
        }
        if (this.state.File) {
            this.state.ImageUrl = null;
            this.convertFileToBase64(this.state.File);
        }
        if (this.state.AspectRatios) {
            this.addRatios(this.state.AspectRatios);
        }
        else {
            this.ratios = NGX_DEFAULT_RATIOS;
        }
        if (!this.state.ImageUrl && !this.state.File) {
            console.error("Property ImageUrl or File is missing, Please provide an url or file in the config options.");
        }
        if (!this.state.ImageName) {
            console.error("Property ImageName is missing, Please provide a name for the image.");
        }
    }
    /**
     * @param {?} file
     * @return {?}
     */
    convertFileToBase64(file) {
        const /** @type {?} */ reader = new FileReader();
        reader.addEventListener("load", (e) => {
            this.previewImageURL = e.target["result"];
        }, false);
        reader.readAsDataURL(file);
        reader.onloadend = (() => {
            // NOTE since getting the base64 image url happens asynchronously we need to initializeCropper after
            // the image has been loaded.
            this.initializeCropper();
        });
    }
    /**
     * @param {?} ratios
     * @return {?}
     */
    addRatios(ratios) {
        this.ratios = [];
        ratios.forEach((ratioType) => {
            const /** @type {?} */ addedRation = NGX_DEFAULT_RATIOS.find((ratio) => {
                return ratio.text === ratioType;
            });
            this.ratios.push(addedRation);
        });
    }
    /**
     * @return {?}
     */
    handleCrop() {
        this.loading = true;
        setTimeout(() => {
            this.croppedImage = this.cropper.getCroppedCanvas({ fillColor: this.canvasFillColor })
                .toDataURL(this.state.ImageType);
            setTimeout(() => {
                this.imageWidth = this.croppedImg.nativeElement.width;
                this.imageHeight = this.croppedImg.nativeElement.height;
            });
            this.cropper.getCroppedCanvas({ fillColor: this.canvasFillColor }).toBlob((blob) => {
                this.blob = blob;
                this.updateImage();
            });
            this.zoomIn = 1;
            this.loading = false;
        }, 2000);
    }
    /**
     * @return {?}
     */
    undoCrop() {
        this.croppedImage = null;
        this.blob = null;
        this.updateImage();
        setTimeout(() => {
            this.initializeCropper();
        }, 100);
    }
    /**
     * @return {?}
     */
    saveImage() {
        this.updateImage();
    }
    /**
     * @return {?}
     */
    updateImage() {
        this.file.emit(new File([this.blob], this.state.ImageName, { type: this.state.ImageType }));
    }
    /**
     * @return {?}
     */
    initializeCropper() {
        this.cropper = new Cropper(this.previewImage.nativeElement, {
            zoomOnWheel: true,
            viewMode: 0,
            center: true,
            ready: () => this.loading = false,
            dragMode: 'move',
            crop: (e) => {
                this.imageHeight = Math.round(e.detail.height);
                this.imageWidth = Math.round(e.detail.width);
                this.cropBoxWidth = Math.round(this.cropper.getCropBoxData().width);
                this.cropBoxHeight = Math.round(this.cropper.getCropBoxData().height);
                this.canvasWidth = Math.round(this.cropper.getCanvasData().width);
                this.canvasHeight = Math.round(this.cropper.getCanvasData().height);
            }
        });
        this.setRatio(this.ratios[0].value);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    setRatio(value) {
        this.cropper.setAspectRatio(value);
    }
    /**
     * @param {?} input
     * @param {?=} zoom
     * @return {?}
     */
    zoomChange(input, zoom) {
        if (this.croppedImage) {
            if (zoom) {
                zoom === 'zoomIn' ? this.zoomIn += 0.1 : this.zoomIn -= 0.1;
            }
            else {
                if (input < this.sliderValue) {
                    this.zoomIn = -Math.abs(input / 100);
                }
                else {
                    this.zoomIn = Math.abs(input / 100);
                }
            }
            if (this.zoomIn <= 0.1) {
                this.zoomIn = 0.1;
            }
        }
        else {
            if (zoom) {
                this.cropper.zoom(input);
                this.zoomIn = input;
            }
            else {
                if (input < this.sliderValue) {
                    this.cropper.zoom(-Math.abs(input / 100));
                }
                else {
                    this.cropper.zoom(Math.abs(input / 100));
                }
                if (input === 0) {
                    this.cropper.zoom(-1);
                }
            }
        }
        if (!zoom) {
            this.sliderValue = input;
        }
        else {
            input > 0 ? this.sliderValue += Math.abs(input * 100) : this.sliderValue -= Math.abs(input * 100);
        }
        if (this.sliderValue < 0) {
            this.sliderValue = 0;
        }
    }
    /**
     * @param {?} canvasWidth
     * @return {?}
     */
    setImageWidth(canvasWidth) {
        if (canvasWidth) {
            this.cropper.setCanvasData({
                left: this.cropper.getCanvasData().left,
                top: this.cropper.getCanvasData().top,
                width: Math.round(canvasWidth),
                height: this.cropper.getCanvasData().height
            });
        }
    }
    /**
     * @param {?} canvasHeight
     * @return {?}
     */
    setImageHeight(canvasHeight) {
        if (canvasHeight) {
            this.cropper.setCanvasData({
                left: this.cropper.getCanvasData().left,
                top: this.cropper.getCanvasData().top,
                width: this.cropper.getCanvasData().width,
                height: Math.round(canvasHeight)
            });
        }
    }
    /**
     * @param {?} cropBoxWidth
     * @return {?}
     */
    setCropBoxWidth(cropBoxWidth) {
        if (cropBoxWidth) {
            this.cropper.setCropBoxData({
                left: this.cropper.getCropBoxData().left,
                top: this.cropper.getCropBoxData().top,
                width: Math.round(cropBoxWidth),
                height: this.cropper.getCropBoxData().height
            });
        }
    }
    /**
     * @param {?} cropBoxHeight
     * @return {?}
     */
    setCropBoxHeight(cropBoxHeight) {
        if (cropBoxHeight) {
            this.cropper.setCropBoxData({
                left: this.cropper.getCropBoxData().left,
                top: this.cropper.getCropBoxData().top,
                width: this.cropper.getCropBoxData().width,
                height: Math.round(cropBoxHeight)
            });
        }
    }
    /**
     * @return {?}
     */
    centerCanvas() {
        const /** @type {?} */ cropBoxLeft = (this.cropper.getContainerData().width - this.cropper.getCropBoxData().width) / 2;
        const /** @type {?} */ cropBoxTop = (this.cropper.getContainerData().height - this.cropper.getCropBoxData().height) / 2;
        const /** @type {?} */ canvasLeft = (this.cropper.getContainerData().width - this.cropper.getCanvasData().width) / 2;
        const /** @type {?} */ canvasTop = (this.cropper.getContainerData().height - this.cropper.getCanvasData().height) / 2;
        this.cropper.setCropBoxData({
            left: cropBoxLeft,
            top: cropBoxTop,
            width: this.cropper.getCropBoxData().width,
            height: this.cropper.getCropBoxData().height
        });
        this.cropper.setCanvasData({
            left: canvasLeft,
            top: canvasTop,
            width: this.cropper.getCanvasData().width,
            height: this.cropper.getCanvasData().height
        });
    }
}
NgxImageEditorComponent.decorators = [
    { type: Component, args: [{
                selector: 'ngx-image-editor',
                template: `
      <div class="ngx-image-editor-component" fxLayout="column" fxLayoutAlign="center stretch">
          <div mat-dialog-title class="photo-editor-header">
              <mat-icon>photo</mat-icon>
              <div class="file-name">{{state.ImageName}}</div>
              <button [hidden]="croppedImage" mat-icon-button color="accent" matTooltip="Crop image"
                      (click)="handleCrop()">
                  <mat-icon>crop</mat-icon>
              </button>
              <button mat-icon-button
                      [hidden]="croppedImage"
                      color="accent"
                      matTooltip="Center canvas"
                      (click)="centerCanvas()">
                  <mat-icon>center_focus_strong</mat-icon>
              </button>
          </div>

          <div mat-dialog-content
               #dialogCropContainer
               class="dialog-crop-container"
               fxLayout="column"
               fxLayoutAlign="center center"
               fxFlex="grow">
              <ng-template [ngIf]="!croppedImage">
                  <div
                          [style.visibility]="loading ? 'hidden' : 'visible'"
                          [style.background]="canvasFillColor"
                          class="img-container">
                      <img #previewimg
                           [src]="previewImageURL">
                  </div>
              </ng-template>
              <ng-template [ngIf]="croppedImage && !loading">
                  <div class="cropped-image">
                      <img #croppedImg
                           [ngStyle]="{'transform': 'scale(' + zoomIn + ')'}"
                           [src]="croppedImage">
                  </div>
              </ng-template>
              <mat-progress-spinner *ngIf="loading" mode="indeterminate"></mat-progress-spinner>
          </div>

          <div
                  class="dialog-button-actions"
                  mat-dialog-actions
                  fxLayout="column"
                  align="start"
                  fxFlex="nogrow">

              <div class="image-detail-toolbar" fxFlex="100">
                  <div class="image-dimensions"><b>Width:</b> <span>{{imageWidth}}px</span> <b>Height:</b> <span>{{imageHeight}}px</span></div>
                  <span fxFlex></span>
                  <div class="image-zoom">
                      <button mat-icon-button color="accent" (click)="zoomChange(0.1, 'zoomIn')">
                          <mat-icon>zoom_in</mat-icon>
                      </button>
                      <mat-slider [value]="sliderValue" (input)="zoomChange($event.value)" thumbLabel></mat-slider>
                      <button mat-icon-button color="accent" (click)="zoomChange(-0.1, 'zoomOut')">
                          <mat-icon>zoom_out</mat-icon>
                      </button>
                  </div>
              </div>
              <div class="cropped-image-buttons" [style.visibility]="!croppedImage ? 'hidden' : 'visible'">
                  <button mat-raised-button color="accent" (click)="saveImage()">
                      <mat-icon>done</mat-icon>
                      <span>Save</span>
                  </button>
                  <button mat-raised-button color="accent" (click)="undoCrop()">
                      <mat-icon>undo</mat-icon>
                      <span>Undo</span>
                  </button>
              </div>
              <div fxLayout="row" [style.visibility]="croppedImage ? 'hidden' : 'visible'">
                  <mat-button-toggle-group
                          #dragMode="matButtonToggleGroup"
                          (change)="cropper.setDragMode($event.value)"
                          value="move">
                      <mat-button-toggle value="move" matTooltip="Move mode">
                          <mat-icon>open_with</mat-icon>
                      </mat-button-toggle>
                      <mat-button-toggle value="crop" matTooltip="Crop mode">
                          <mat-icon>crop</mat-icon>
                      </mat-button-toggle>
                  </mat-button-toggle-group>

                  <mat-button-toggle-group
                          #selectRatio="matButtonToggleGroup"
                          (change)="setRatio($event.value)"
                          value="{{ratios[0].value}}">
                      <mat-button-toggle *ngFor="let ratio of ratios" value="{{ratio.value}}" matTooltip="Aspect ratio">
                          {{ratio.text}}
                      </mat-button-toggle>
                  </mat-button-toggle-group>

              </div>
              <div
                      class="canvas-config"
                      fxLayout="row"
                      fxLayoutAlign="start space-between"
                      fxLayoutGap="10px"
                      [style.visibility]="croppedImage ? 'hidden' : 'visible'">

                  <mat-form-field color="accent" fxFlex="100">
                      <input matInput
                             fxFlex="100"
                             id="imageWidth"
                             placeholder="Canvas width"
                             type="number"
                             (ngModelChange)="setImageWidth($event)"
                             [ngModel]="canvasWidth">
                  </mat-form-field>

                  <mat-form-field color="accent" fxFlex="100">
                      <input matInput
                             fxFlex="100"
                             id="imageHeight"
                             placeholder="Canvas height"
                             type="number"
                             (ngModelChange)="setImageHeight($event)"
                             [ngModel]="canvasHeight">
                  </mat-form-field>

                  <mat-form-field color="accent" fxFlex="100">
                      <input matInput
                             fxFlex="100"
                             id="cropBoxWidth"
                             placeholder="Cropbox width"
                             type="number"
                             (ngModelChange)="setCropBoxWidth($event)"
                             [ngModel]="cropBoxWidth">
                  </mat-form-field>

                  <mat-form-field color="accent" fxFlex="100">
                      <input matInput
                             fxFlex="100"
                             id="cropBoxHeight"
                             placeholder="Cropbox height"
                             type="number"
                             (ngModelChange)="setCropBoxHeight($event)"
                             [ngModel]="cropBoxHeight">
                  </mat-form-field>

                  <!--<md2-colorpicker [(ngModel)]="canvasFillColor"  placeholder="Canvas color"></md2-colorpicker>-->

              </div>
          </div>

      </div>

  `,
                styles: [`

      .ngx-image-editor-component .photo-editor-header {
          display: flex;
          justify-content: space-around;
          align-items: center;
          width: 100%;
          padding: 5px 0;
          z-index: 100;
          margin: 0;
      }

      .ngx-image-editor-component .photo-editor-header > .mat-icon {
          padding: 0 10px;
      }

      .ngx-image-editor-component .photo-editor-header > .file-name {
          flex: 1 1 100%;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
      }

      .ngx-image-editor-component mat-progress-spinner {
          position: absolute;
      }

      .ngx-image-editor-component .dialog-crop-container {
          width: 800px;
          height: 400px;
          overflow: hidden;
      }

      .ngx-image-editor-component .cropper-bg {
          background-image: none !important;
      }

      .ngx-image-editor-component .cropper-bg > .cropper-modal {
          opacity: 1 !important;
          background: none;
      }

      .ngx-image-editor-component .img-container {
          width: 800px !important;
          height: 400px !important;
      }

      .ngx-image-editor-component .cropped-image img {
          width: auto !important;
          height: auto !important;
          max-width: 800px !important;
          max-height: 400px !important;
      }

      .ngx-image-editor-component .dialog-button-actions {
          position: relative;
          padding: 0;
      }

      .ngx-image-editor-component .dialog-button-actions:last-child {
          margin: 0;
      }

      .ngx-image-editor-component .dialog-button-actions > DIV mat-button-toggle-group {
          margin: 20px;
      }

      .ngx-image-editor-component .dialog-button-actions .cropped-image-buttons {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
      }

      .ngx-image-editor-component .dialog-button-actions > .canvas-config {
          padding: 5px;
          margin: 0 20px;
      }

      

      .ngx-image-editor-component .dialog-button-actions > .canvas-config md2-colorpicker {
          width: 200px !important;
      }
      

      .ngx-image-editor-component .dialog-button-actions .image-detail-toolbar > .image-zoom {
          display: flex;
          align-items: center;
          padding: 0 10px;
      }
      
      .ngx-image-editor-component .dialog-button-actions .image-detail-toolbar > .image-zoom .mat-slider-horizontal .mat-slider-wrapper .mat-slider-thumb-container {
          cursor: grab;
      }
      

      .ngx-image-editor-component .dialog-button-actions .image-detail-toolbar > .image-dimensions {
          padding: 0 10px;
          font-size: 14px;
          width: 200px;
          max-width: 200px;
      }

   










  `],
                encapsulation: ViewEncapsulation.None
            },] },
];
/** @nocollapse */
NgxImageEditorComponent.ctorParameters = () => [];
NgxImageEditorComponent.propDecorators = {
    "previewImage": [{ type: ViewChild, args: ['previewimg',] },],
    "croppedImg": [{ type: ViewChild, args: ['croppedImg',] },],
    "config": [{ type: Input },],
    "file": [{ type: Output },],
};
/**
 * @record
 */

class EditorOptions {
}
/**
 * @record
 */

const NGX_DEFAULT_RATIOS = [
    {
        value: 16 / 9, text: '16:9'
    },
    {
        value: 4 / 3, text: '4:3'
    },
    {
        value: 1 / 1, text: '1:1'
    },
    {
        value: 2 / 3, text: '2:3'
    },
    {
        value: 0 / 0, text: 'Default'
    }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class NgxImageEditorModule {
    /**
     * @return {?}
     */
    static forRoot() {
        return {
            ngModule: NgxImageEditorModule,
        };
    }
}
NgxImageEditorModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    FormsModule,
                    BrowserAnimationsModule,
                    CommonModule,
                    ReactiveFormsModule,
                    FlexLayoutModule,
                    MatButtonModule,
                    MatIconModule,
                    MatDialogModule,
                    MatInputModule,
                    MatMenuModule,
                    MatProgressSpinnerModule,
                    MatTabsModule,
                    MatTooltipModule,
                    MatButtonToggleModule,
                    MatSliderModule,
                    MatAutocompleteModule
                ],
                declarations: [
                    NgxImageEditorComponent
                ],
                exports: [NgxImageEditorComponent]
            },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Generated bundle index. Do not edit.
 */

export { NgxImageEditorModule, NgxImageEditorComponent, EditorOptions, NGX_DEFAULT_RATIOS };
//# sourceMappingURL=ngx-image-editor.js.map
