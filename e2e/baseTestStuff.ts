import {ActivatedRoute} from "@angular/router";
import {AppRoutingModule} from "../src/app/app-routing/app-routing.module";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {TravelEditComponent} from "../src/app/travel-edit/travel-edit.component";

export function getBaseTestStuff(componenets: any[], values?: {[paramID: string]: number | string}): any {
  const fakeActivatedRoute = values ? getBaseActivatedTestRoute(values) : null;

  const provs = [
    {provide: ActivatedRoute, useValue: fakeActivatedRoute}
  ];

  if(!fakeActivatedRoute) {
    provs[0].useValue = null;
  }

  return [
    fakeActivatedRoute,
    {
      providers: provs,
      imports: [AppRoutingModule, HttpClientTestingModule],
      declarations: componenets
    }
  ];
}

export function getBaseTestStuffService() {
  return {
    imports: getBaseTestStuff([]).imports
  }
}

export function getBaseActivatedTestRoute(values: {[paramID: string]: number | string}) {
  return <any>{
    snapshot: {
      data: {},
      paramMap: {
        get: (name: string) => {
          // switch (name) {
          //   case "userlID":
          //     1;
          //     break;
          // }

          for(const key of Object.keys(values)) {
            if(name === key) {
              return values[key];
            }
          }

          return null;
        }
      }
    }
  } as ActivatedRoute;
}
