import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {
  @ViewChild('editForm') editForm: NgForm; // gives access to the form
  member: Member;
  user: User;

  // for events like closing the tab or browser
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any): any {
    if (this.editForm.dirty){
      $event.returnValue = true;
    }
  }

  constructor(private accountService: AccountService, private memberService: MembersService, private toastr: ToastrService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => this.user = user);
  }

  ngOnInit(): void {
    this.loadMember();
  }

  loadMember(): void {
    this.memberService.getMember(this.user.username).subscribe(member => {
      this.member = member;
    });
  }

  updateMember(): void {
    // () since there is no return
    this.memberService.updateMember(this.member).subscribe(() => {
      this.toastr.success('Profile updated successfully!');
      this.editForm.reset(this.member); // to reset form at the same time keep changes
    });
  }

}
