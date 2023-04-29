import {AfterViewInit, Component, OnInit, ViewEncapsulation} from '@angular/core';
import { defaults as defaultControls } from 'ol/control';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import ZoomToExtent from 'ol/control/ZoomToExtent';

import * as VectorLaya from "ol/layer/Vector";
import Vector from  "ol/source/Vector";

import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import Circle from "ol/style/Circle";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import {fromLonLat, toLonLat, transform} from "ol/proj";
import {Geometry} from "ol/geom";
import {Fill, Stroke} from "ol/style";

import {IIpInfo, IpInfoService} from "../ip-info.service";
import {MapBrowserEvent, Overlay} from "ol";

@Component({
  selector: 'app-osp-map',
  templateUrl: './osp-map.component.html',
  // styleUrls: ["ol/ol.css", './osp-map.component.css']
  styleUrls: ['./osp-map.component.css']
})
export class OspMapComponent implements OnInit, AfterViewInit {
  // @ts-ignore
  map: Map;

  private _vectorSource: Vector<any> | undefined = undefined;
  private _data: IIpInfo[] = [];
  private overlay: Overlay | undefined = undefined;

  constructor(private readonly _ipInfoService: IpInfoService) {}

  ngAfterViewInit() {
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        })
      ],
      view: new View({
        // center: [813079.7791264898, 5929220.284081122],
        center: fromLonLat([111.9006, -8.0647]),
        zoom: 5
      }),
      controls: defaultControls().extend([
        new ZoomToExtent({
          extent: [
            813079.7791264898, 5929220.284081122,
            848966.9639063801, 5936863.986909639
          ]
        })
      ])
    });

    this.overlay = new Overlay({
      element: document.querySelector("#popup") as HTMLDivElement,
      autoPan: true,
      // autoPanAnimation: {
      //   duration: 250
      // }
    });
    this.map.addOverlay(this.overlay);

    this.map.on('singleclick', (event: MapBrowserEvent<any>) => {
      console.log("clicked");
      if(!this.overlay) {
        return;
      }
      const overlay = this.overlay;

      if (this.map.hasFeatureAtPixel(event.pixel) === true) {
        const coordinate = event.coordinate;
        overlay.setPosition(coordinate);
        this.markerClicked(event);
      } else {
        overlay.setPosition(undefined);
        (document.querySelector("#popup-closer") as HTMLDivElement).blur();
      }
    });

    this._ipInfoService.getIpData().subscribe((data: IIpInfo[]) => {
      this._data = data;
      this.addMarkers();
    })

  }

  ngOnInit(): void {
  }

  private addMarker(heatPerc: number, lon: number, lat: number) {
    const markerGeometry: Point = new Point(transform(fromLonLat([lon, lat]), 'EPSG:4326', 'EPSG:4326'));
    const markerFeature: Feature<Geometry> = new Feature({
      geometry: markerGeometry
    });

    const markerStyle: Icon = new Icon(({
      src: 'https://raw.githubusercontent.com/openlayers/openlayers/v3.20.1/examples/resources/logo-70x70.png'
      // src: 'https://github.com/openlayers/openlayers/blob/v3.20.1/examples/resources/logo-70x70.png'
      // logo-70x70.png
    }));

    const img = new Circle({
      radius: 6,
      stroke: new Stroke({
        color: '#fff'
      }),
      fill: new Fill({
        color: OspMapComponent.getColor(heatPerc)
      })
    });

    markerFeature.setStyle(new Style({
      // image: markerStyle,
      image: img
    }));

    if (this._vectorSource === undefined) {
      const vectorSource: Vector<any> = new Vector<any>({
        features: [markerFeature]
      });
      this._vectorSource = vectorSource;

      const markerLayer = new VectorLaya.default({
        visible: true,
        source: this._vectorSource
      });

      this.map.addLayer(markerLayer);
    }
    else {
      this._vectorSource.addFeature(markerFeature);
    }
  }

  private addMarker0() {
    const markerFeature: Feature = new Feature({
      geometry: new Point(fromLonLat([111.9006, -8.0647]))
    });

    const markerLayer = new VectorLaya.default({
      source: new Vector({
        features: [
          markerFeature
        ]
      })
    });

    this.map.addLayer(markerLayer);
  }

  private static getColor(heatPerc: number) {
    const r = "FF", b = "00";

    // 100% -> 0          = 204 - 204
    // 0%   -> 204 ("CC") = 204 - 0
    // X%   -> 204 - (204 * heatPerc)
    const gNumber = 204 - Math.round(204 * heatPerc);
    const g = gNumber === 0 ? "00" : gNumber.toString(16);

    const color = `#${r}${g}${b}`.toUpperCase();
    // console.log("Color for %s: %s", heatPerc, color);
    return color;
  }

  private addMarkers() {
    let max = 0;
    const grouped = this._data.reduce((res: {[theKey: string]: any[]}, item: IIpInfo, index: number, allItems: IIpInfo[]) => {
      const lon = item.lon;
      const lat = item.lat;
      const key: string = `${lon}_${lat}`;
      if (!res[key]) {
        // const all = allItems.filter(a => a.query === ip);
        const all = allItems.filter(a => a.lon === lon && a.lat === lat);

        if(all.length > max) {
          max = all.length;
        }

        res[key] = all.slice()
      }
      return res;
    }, {});
    console.log(grouped);

    // const keys = Object.keys(grouped);
    for(const key in grouped) {
      const arr: IIpInfo[] = grouped[key];
      const tot = arr.length;
      const perc = tot / max;
      this.addMarker(perc, arr[0].lon, arr[0].lat);
    }
  }

  private markerClicked(event: MapBrowserEvent<any>) {
    console.log("coord: %o", event.coordinate);

    const [lon, lat] = toLonLat(event.coordinate);
    console.log("lonlat: %o", [lon, lat]);

    const ordered = this._data.map((m: IIpInfo) => {
      const newO = Object.assign({}, m);
      newO.diff = Math.abs(m.lon - lon);

      return newO;
    });
    ordered.sort((a: IIpInfo, b: IIpInfo) => (a.diff || 0) - (b.diff || 0));
    console.log(ordered.join("\n"));

    const closest = ordered[0];

    const items = this._data.filter(d => d.lon === closest.lon && d.lat === closest.lat);

    (document.querySelector("#popup-content") as HTMLDivElement).innerHTML
      = `<pre>${JSON.stringify(items, null, 2)}</pre><a href="https://www.google.com/maps/place/@${closest.lat},${closest.lon},18z">See on Google Maps</a>`;
    console.log("new content");
  }
}
