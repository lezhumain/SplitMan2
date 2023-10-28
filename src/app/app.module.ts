import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import {AppRoutingModule} from "./app-routing/app-routing.module";
import {FormsModule} from "@angular/forms";
import { LoginComponent } from './login/login.component';
import { TravelListComponent } from './travel-list/travel-list.component';
import { TravelEditComponent } from './travel-edit/travel-edit.component';
import { TravelComponent } from './travel/travel.component';
import { ExpenseEditComponent } from './expense-edit/expense-edit.component';
import { ExpenseComponent } from './expense/expense.component';
import { RepartitionComponent } from './repartition/repartition.component';
import { RepartitionCardComponent } from './repartition-card/repartition-card.component';
import { ExpenseCardComponent } from './expense-card/expense-card.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { ParticipantEditComponent } from './participant-edit/participant-edit.component';
import { InviteComponent } from './invite/invite.component';
import { InviteListComponent } from './invite-list/invite-list.component';
import {AuthGuard} from "./app-routing/auth-guard";
import { TravelCardComponent } from './travel-card/travel-card.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import {HttpClientModule} from "@angular/common/http";
import { TestEndpointComponent } from './test-endpoint/test-endpoint.component';
import { ToastComponent } from './toast/toast.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AutocompleteLibModule} from "angular-ng-autocomplete";
import { BalanceComponent } from './balance/balance.component';
import { BalanceItemComponent } from './balance-item/balance-item.component';
import { ExpenseFilterComponent } from './expense-filter/expense-filter.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    TravelListComponent,
    TravelEditComponent,
    TravelComponent,
    ExpenseEditComponent,
    ExpenseComponent,
    RepartitionComponent,
    RepartitionCardComponent,
    ExpenseCardComponent,
    NavBarComponent,
    ParticipantEditComponent,
    InviteComponent,
    InviteListComponent,
    TravelCardComponent,
    UserProfileComponent,
    UserEditComponent,
    TestEndpointComponent,
    ToastComponent,
    BalanceComponent,
    BalanceItemComponent,
    ExpenseFilterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AutocompleteLibModule
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
