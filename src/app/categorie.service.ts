import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private _colorCache: { [categorie: string]: string } = {};
  constructor() { }

  getBackgroundColorFor(categorieName: string): string {
    const cached = this._colorCache[categorieName];
    if(cached) {
      return cached;
    }

    const color = CategorieService.getRandomColor();
    this._colorCache[categorieName] = color;
    return color;
    }

  private static getRandomColor(): string {
    return Math.floor(Math.random()*16777215).toString(16);
  }
}
