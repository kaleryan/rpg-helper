import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InputOutputComponent } from './components/input-output/input-output.component';
import { NpcModelFieldListEditorComponent } from '@app/components/npc-model-field-list-editor/npc-model-field-list-editor.component';
import { NpcModelSheetListEditorComponent } from '@app/components/npc-model-sheet-list-editor/npc-model-sheet-list-editor.component';
import { NpcRealSheetListEditorComponent } from '@app/components/npc-real-sheet-list-editor/npc-real-sheet-list-editor.component';
import { NpcWorldEditorComponent } from './components/npc-world-editor/npc-world-editor.component';

const routes: Routes = [
  { path: '', redirectTo: '/npc-model-sheet-list-editor', pathMatch: 'full' },
  { path: 'input-output', component: InputOutputComponent },
  { path: 'npc-world-editor', component: NpcWorldEditorComponent },
  { path: 'npc-model-sheet-list-editor', component: NpcModelSheetListEditorComponent },
  { path: 'npc-real-sheet-list-editor', component: NpcRealSheetListEditorComponent },
  { path: 'npc-model-field-list-editor', component: NpcModelFieldListEditorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
