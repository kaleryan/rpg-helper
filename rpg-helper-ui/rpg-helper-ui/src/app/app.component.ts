import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import { NpcWorldService } from './dal/db-service/npc-world.service';
import { UtilsHttp } from './utils/UtilsHttp';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'rpg-helper';

  private generatorUrlQuery = 'generatorUrl';
  private defaultGeneratorUrl = 'assets/EmergenceGeneratorRealSheet.json';

  constructor(private location: Location) { }

  ngOnInit() {
    // const path = this.location.path();
    // const generatorUrl = UtilsHttp.parseQueryString(this.location.path().split('?')[1])[this.generatorUrlQuery]
    //   || this.defaultGeneratorUrl;

    // console.log('loaded generator realSheet: ', generatorUrl);
    // this.npcWorldService.initFromUrl(generatorUrl);
  }
}
