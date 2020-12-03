import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { take } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { Message } from 'src/app/_models/message';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { MessageService } from 'src/app/_services/message.service';
import { PresenceService } from 'src/app/_services/presence.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  // static -> able to react to changes in the component
  // if we make it static, we need to remove the conditional in the component
  @ViewChild('memberTabs', {static: true}) memberTabs: TabsetComponent;
  member: Member;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  activeTab: TabDirective;
  messages: Message[] = [];
  user: User;

  constructor(public presence: PresenceService, private route: ActivatedRoute, private messageService: MessageService,
              private accountService: AccountService, private router: Router) {
                this.accountService.currentUser$.pipe(take(1)).subscribe(user => this.user = user);
                this.router.routeReuseStrategy.shouldReuseRoute = () => false;
               }

  ngOnInit(): void {
    // this.loadMember();
    this.route.data.subscribe(data => {
      this.member = data.member;
    });

    // check if there is tab in params
    this.route.queryParams.subscribe(params => {
      params.tab ? this.selectTab(3) : this.selectTab(0);
    });

    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4, // number if images below the image
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ];

    this.galleryImages = this.getImages(); // to have the photos when the page loads
  }

  getImages(): NgxGalleryImage[] {
    const imageUrls = [];

    for (const photo of this.member.photos){
      imageUrls.push({
        small: photo?.url,
        medium: photo?.url,
        big: photo?.url
      });
    }

    return imageUrls;
  }

  // loadMember(): void{
  //   this.memberService.getMember(this.route.snapshot.paramMap.get('username')).subscribe(member => {
  //     this.member = member;
  //   });
  // }

  loadMessages(): void
  {
    this.messageService.getMessageThread(this.member.username).subscribe(message => {
      this.messages = message;
    });
  }

  onTabActivated(data: TabDirective): void
  {
    this.activeTab = data;
    if (this.activeTab.heading === 'Messages' && this.messages.length === 0)
    {
      this.messageService.createHubConnection(this.user, this.member.username);
    }
    else
    {
      this.messageService.stopHubConnection();
    }
  }

  // to activate Messages tab
  selectTab(tabId: number): void
  {
    this.memberTabs.tabs[tabId].active = true;
  }

  // anything else will destroy the connection in the hub
  ngOnDestroy(): void
  {
    this.messageService.stopHubConnection();
  }

}
