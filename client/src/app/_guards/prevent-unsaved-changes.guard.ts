import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { MemberEditComponent } from '../members/member-edit/member-edit.component';

@Injectable({
  providedIn: 'root'
})
export class PreventUnsavedChangesGuard implements CanDeactivate<unknown> {

  // to give access to the edit form
  canDeactivate(component: MemberEditComponent ): boolean  {
    if (component.editForm.dirty){
      return confirm('Any unsaved changes will be lost!!');
    }
    return true;
  }

}
