import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Message } from '../_models/message';
import { MessageParams } from '../_models/messageParams';
import { Pagination } from '../_models/pagination';
import { ConfirmService } from '../_services/confirm.service';
import { MessageService } from '../_services/message.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages: Message[] = [];
  pagination: Pagination;
  messageParams: MessageParams;

  constructor(private messageService: MessageService, private toastr: ToastrService, private confirmService: ConfirmService) {
    this.messageParams = messageService.getMessageParams();
  }

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void
  {
    this.messageParams.loading = true;
    this.messageService.getMessages(this.messageParams).subscribe(response => {
      this.messages = response.result;
      this.pagination = response.pagination;
      this.messageParams.loading = false;
    });
  }

  deleteMessage(id: number): void
  {
    this.confirmService.confirm('Confirm delete message?', 'This action cannot be undone!').subscribe(result => {
      if (result)
      {
        this.messageService.deleteMessage(id).subscribe(() => {
          this.messages.splice(this.messages.findIndex(m => m.id === id), 1);
          this.toastr.success('Message deleted!');
        });
      }
    });
  }

  pageChanged(event: any): void
  {
    this.messageParams.pageNumber = event.page;
    this.loadMessages();
  }

}
