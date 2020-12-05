import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-test-errors',
  templateUrl: './test-errors.component.html',
  styleUrls: ['./test-errors.component.css']
})
export class TestErrorsComponent implements OnInit {
  baseUrl = environment.apiUrl;
  validationErrors: string[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  logError(error: any, statusText: string): any {
    error.statusText = error.statusText === 'OK' ? statusText : error.statusText;

    return error;
  }

  get400ValidationError(): void {
    this.http.post(this.baseUrl + 'account/register', {}).subscribe(response => {
      console.log(response);
    }, error => {
      error = this.logError(error, 'Bad Request');
      console.log(error);
      this.validationErrors = error;
    });
  }

  get400Error(): void {
    this.http.get(this.baseUrl + 'buggy/bad-request').subscribe(response => {
      console.log(response);
    }, error => {
      error = this.logError(error, 'Bad Request');
      console.log(error);
    });
  }

  get401Error(): void {
    this.http.get(this.baseUrl + 'buggy/auth').subscribe(response => {
      console.log(response);
    }, error => {
      error = this.logError(error, 'Unauthorized');
      console.log(error);
    });
  }

  get404Error(): void {
    this.http.get(this.baseUrl + 'buggy/not-found').subscribe(response => {
      console.log(response);
    }, error => {
      error = this.logError(error, 'Not Found');
      console.log(error);
    });
  }

  get500Error(): void {
    this.http.get(this.baseUrl + 'buggy/server-error').subscribe(response => {
      console.log(response);
    }, error => {
      error = this.logError(error, 'Internal Server Error');
      console.log(error);
    });
  }
}
