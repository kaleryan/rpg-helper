import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppMenuComponent } from './app.menu.component';
import { AngularMaterialModule } from './app-material.module';
import { InputOutputComponent } from './components/input-output/input-output.component';
import { GenMultiChoiceComponent } from './gen/widgets/gen-multi-choice/gen-multi-choice.component';
import { NpcRealSheetEditorService } from './dal/db-service/npc-real-sheet-editor.service';
import { NpcModelEditorService } from './dal/db-service/npc-model-editor.service';
import { GenFormDialogComponent } from './gen/widgets/gen-form-dialog/gen-form-dialog.component';
import { NpcRealSheetListEditorComponent } from './components/npc-real-sheet-list-editor/npc-real-sheet-list-editor.component';
import { NpcRealSheetEditorComponent } from './components/npc-real-sheet-editor/npc-real-sheet-editor.component';
import { NpcModelSheetEditorComponent } from './components/npc-model-sheet-editor/npc-model-sheet-editor.component';
import { NpcModelInstFieldListEditorComponent } from './components/npc-model-field-inst-list-editor/npc-model-inst-field-list-editor.component';
import { NpcRealFieldEmbeddedListEditorComponent } from './components/npc-real-field-embeddedlist-editor/npc-real-field-embeddedlist-editor.component';
import { NpcModelFieldListEditorComponent } from './components/npc-model-field-list-editor/npc-model-field-list-editor.component';
import { NpcModelFieldEditorComponent } from './components/npc-model-field-editor/npc-model-field-editor.component';
import { NpcWorldState } from './dal/store/npc-world.state';
import { NpcGeneratorService } from './dal/db-service/npc-generator.service';
import { NpcWorldService } from './dal/db-service/npc-world.service';
import { NpcModelSheetListEditorComponent } from './components/npc-model-sheet-list-editor/npc-model-sheet-list-editor.component';
import { NpcWorldResolverService } from './dal/db-service/npc-world-resolver.service';
import { NpcModelInstFieldEditorComponent } from './components/npc-model-field-inst-editor/npc-model-inst-field-editor.component';
import { GenInputNumberComponent } from './gen/widgets/gen-input-number/gen-input-number.component';
import { NpcRealSheetViewerComponent } from './components/npc-real-sheet-viewer/npc-real-sheet-viewer.component';
import { NpcRealFieldEditorComponent } from './components/npc-real-field-editor/npc-real-field-editor.component';
import { GenSelectLabelledComponent } from './gen/widgets/gen-select-labelled/gen-select-labelled.component';
import { NpcModelContainedSheetListEditorComponent } from './components/npc-model-contained-sheet-list-editor/npc-model-contained-sheet-list-editor.component';
import { NpcWorldEditorComponent } from './components/npc-world-editor/npc-world-editor.component';

@NgModule({
  declarations: [
    AppComponent,
    AppMenuComponent,
    NpcRealSheetListEditorComponent,
    NpcWorldEditorComponent,
    NpcRealSheetEditorComponent,
    NpcRealSheetEditorComponent,
    NpcModelSheetEditorComponent,
    NpcModelSheetListEditorComponent,
    NpcModelInstFieldListEditorComponent,
    NpcRealFieldEmbeddedListEditorComponent,
    NpcModelFieldListEditorComponent,
    NpcModelFieldEditorComponent,
    InputOutputComponent,
    GenFormDialogComponent,
    GenMultiChoiceComponent,
    NpcModelInstFieldEditorComponent,
    NpcModelContainedSheetListEditorComponent,
    GenInputNumberComponent,
    NpcRealSheetViewerComponent,
    NpcRealFieldEditorComponent,
    GenSelectLabelledComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    FormsModule,
    NgxsModule.forRoot([NpcWorldState], {
      developmentMode: true // !environment.production
    }),
    StorageServiceModule,
    FlexLayoutModule,
    HttpClientModule,
    AppRoutingModule,
    RouterModule,
    NgxsReduxDevtoolsPluginModule.forRoot()
  ],
  providers: [NpcRealSheetEditorService, NpcGeneratorService, NpcModelEditorService, NpcWorldService, NpcWorldResolverService],
  bootstrap: [AppComponent]
})
export class AppModule { }
