import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter(); // for child to parent communication
  registerForm: FormGroup;
  maxDate: Date;
  validationErrors: string[] = [];

  constructor(private accountService: AccountService, private toastr: ToastrService, private fb: FormBuilder,
              private router: Router) { }

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18); // prevents datepicker from picking date less than 18 yrs ago
  }

  // typically, creating a reactive form uses FormBuilder
  initializeForm(): void {
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', Validators.required], // should be the form control name in html
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      // pass the form that needs to be compared to
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]
    });
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      // control?.value -> confirmPassword control
      // code on the right is the value of the password control
      // if match -> return null, if not pass attach a validator error to fail
      return control?.value === control?.parent?.controls[matchTo].value ? null : {isMatching: true};
    };
  }

  register(): void{
    this.accountService.register(this.registerForm.value).subscribe(response => {
      this.router.navigateByUrl('/members');
    }, error => {
      this.validationErrors = error;
    });
  }

  cancel(): void{
    this.cancelRegister.emit(false); // pass any value needed
  }

}
