import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UpdateRealFieldValue } from '@app/dal/store/npc-world.actions';
import { NpcRealField, NpcRealSheet, NpcRealContainer } from '@app/models/NpcRealSheet';
import { FieldType, NpcModelField } from '@app/models/NpcModelField';
import { IStringDictionary } from '@app/utils/UtilsDictionary';
import { NpcWorldResolverService } from '@app/dal/db-service/npc-world-resolver.service';
import { NpcModelInstField, NpcModelSheet } from '@app/models/NpcModelSheet';
import { NpcGeneratorService } from '@app/dal/db-service/npc-generator.service';
import { UtilsLabelledItem } from '@app/utils/UtilsLabelledItem';
import { NpcWorldState } from '@app/dal/store/npc-world.state';
import { NpcRealSheetEditorService } from '@app/dal/db-service/npc-real-sheet-editor.service';

class NpcModelInstFieldView {
  public constructor(public name: string,
    public modelInstField: NpcModelInstField,
    public values: string[],
    public explanations: string,
    public tag: string) {}
}

class NpcModelInstFieldViewTag {
  public modelInstFieldViews: NpcModelInstFieldView[] = [];
  public constructor(public tag: string) {}
}

@Component({
  selector: 'app-npc-real-sheet-viewer',
  templateUrl: './npc-real-sheet-viewer.component.html',
  styleUrls: []
})
export class NpcRealSheetViewerComponent implements OnInit {

  public name = 'RealSheet viewer:';

  @Input('realSheetId')
  set refreshOnRealSheetId(realSheetId : string) {
    this.realSheetId = realSheetId;
    this.refreshData(this.realSheets);
  }

  public realSheets: IStringDictionary<NpcRealSheet>;
  public realSheetId: string;
  public realSheet: NpcRealSheet;
  public realSheetObs: Observable<IStringDictionary<NpcRealSheet>>;
  public realContainer: NpcRealContainer;
  
  public unfilteredRealFields: NpcRealField[];
  public filteredRealFieldsByTag: NpcModelInstFieldViewTag[];

  public filter = '';

  constructor(public store: Store,
    private npcGeneratorService: NpcGeneratorService,
    public wr: NpcWorldResolverService,
    private realSheetEditor: NpcRealSheetEditorService) { 
    this.realSheetObs = this.store.select(state => {
      return state.world.world.realContainer.realSheetsById
    });
  }

  ngOnInit() {
    this.realSheetObs.subscribe(world => this.refreshData(world));
  }

  public refreshData(realSheets: IStringDictionary<NpcRealSheet>) {
    if (realSheets == null) {
      return;
    }
    this.realSheets = realSheets;
    this.realSheet = realSheets[this.realSheetId];
    this.unfilteredRealFields = Object.values(this.realSheet.realFields);
    this.realContainer = this.store.selectSnapshot(NpcWorldState.getWorld).realContainer;
    
    this.refreshDisplay();
  }

  public refreshDisplay() {
    let filteredRawRealFields = this.unfilteredRealFields;
    if (this.filter !== '') {
      filteredRawRealFields = filteredRawRealFields.filter(x => x.name.includes(this.filter) || x.modelInstField.id.includes(this.filter))
    }

    let filteredRealFields = [];

    filteredRawRealFields.forEach(realField => {
      let modelInstField = this.wr.getModelInstField(realField)
      let existingField = filteredRealFields.find(y => y.name === realField.name);
      let sourceString = "";
      let realFieldSelectedValues = this.getSelectedValues(realField);
      if (realField.sourceRef != null) {
        let source = this.wr.get(realField.sourceRef) as any;
        sourceString = source.name;
      }
      let modelField = this.wr.get<NpcModelField>(modelInstField.modelField);
      if (existingField == null) {
        filteredRealFields.push(new NpcModelInstFieldView(realField.name, modelInstField, realFieldSelectedValues,
          "["+realFieldSelectedValues.join()+"] ("+sourceString+")", modelField.tag || sourceString));
      } else {
        if (modelField.fieldType === FieldType.NumbersInRange) {
          let initialValue = existingField.values.length > 0 ? parseInt(existingField.values[0]) : 0;
          let addValue = realField.selectedValues.length > 0 ? parseInt(realField.selectedValues[0]) : 0;
          existingField.values = [(initialValue + addValue).toString()];
        } else {
          existingField.values = existingField.values.concat(realFieldSelectedValues);
        }
        existingField.explanations += " +["+realFieldSelectedValues.join()+"] ("+sourceString+")";
      }
    });

    this.filteredRealFieldsByTag = [];
    filteredRealFields.forEach((field: NpcModelInstFieldView) => {
      let tag = field.tag || "misc"; 
      let byTags = this.filteredRealFieldsByTag.find(x => x.tag === tag);
      if (byTags == null) {
        byTags = new NpcModelInstFieldViewTag(tag);
        this.filteredRealFieldsByTag.push(byTags);
      }      
      byTags.modelInstFieldViews.push(field);
    });
  }
  
  public setFilter($event) {
    this.filter = $event.srcElement.value;
    this.refreshDisplay();
  }
  
  public hasRealSheetValue(labelledRealField: NpcModelInstFieldView) {
    return this.wr.get<NpcModelField>(labelledRealField.modelInstField.modelField).modelSheet_Type != null;
  }
  
  public goToRealFieldValue(labelledRealField: NpcModelInstFieldView, value: string) {
    if (!this.hasRealSheetValue(labelledRealField)) {
      return;
    }
    var url = window.location.href;    
    var urlmain = url.substring(0, url.lastIndexOf('/'));
    url = urlmain + '/npc-real-sheet-list-editor?selectedRealSheetId=' + encodeURI(value);
    window.location.href = url;

    //this.router.navigate(['npc-real-sheet-list-editor'], {queryParams: {selectedRealSheetId: encodeURI(value)}});
  }

  public reroll(isOverwriting: boolean) {
    this.npcGeneratorService.dispatchRerollSheet(this.realSheet, this.unfilteredRealFields, isOverwriting);
    this.refreshDisplay(); // quel souci de refresh necessite ca?
  }
  
  public getSelectedValues(realField: NpcRealField): string[] {
    return this.wr.getSelectedValues(realField, this.realContainer)
      .map(x => x.label);
  }
}

