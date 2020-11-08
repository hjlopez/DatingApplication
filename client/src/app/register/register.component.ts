import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter(); // for child to parent communication
  model: any = {};

  constructor(private accountService: AccountService) { }

  ngOnInit(): void {
  }

  register(): void{
    this.accountService.register(this.model).subscribe(response => {
      console.log(response);
      this.cancel(); // cancel the form
    }, error => {
      console.log(error);
    });
  }

  cancel(): void{
    this.cancelRegister.emit(false); // pass any value needed
  }

}
