import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Message } from 'src/app/_models/message';
import { MessageService } from 'src/app/_services/message.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush, // for the scroll property in messages
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
  @Input() messages: Message[];
  @Input() username: string;
  messageContent: string;
  @ViewChild('messageForm') messageForm: NgForm;
  loading = false;

  constructor(public messageService: MessageService) { }

  ngOnInit(): void {
  }

  sendMessage(): void
  {
    this.loading = true;
    // use then instead of subscribe when using promises
    this.messageService.sendMessage(this.username, this.messageContent).then(() => {
      this.messageForm.reset();
    }).finally(() => this.loading = false);
  }

}
