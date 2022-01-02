import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Route, RouterModule, Routes} from "@angular/router";
import {RegisterComponent} from "../register/register.component";
import {TravelListComponent} from "../travel-list/travel-list.component";
import {LoginComponent} from "../login/login.component";
import {TravelEditComponent} from "../travel-edit/travel-edit.component";
import {TravelComponent} from "../travel/travel.component";
import {ExpenseEditComponent} from "../expense-edit/expense-edit.component";
import {ExpenseComponent} from "../expense/expense.component";
import {ParticipantEditComponent} from "../participant-edit/participant-edit.component";
import {InviteComponent} from "../invite/invite.component";
import {InviteListComponent} from "../invite-list/invite-list.component";
import {AuthGuard} from "./auth-guard";
import {UserProfileComponent} from "../user-profile/user-profile.component";
import {UserEditComponent} from "../user-edit/user-edit.component";
import {TestEndpointComponent} from "../test-endpoint/test-endpoint.component";

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // redirect to `first-component`
  { path: 'genimg', component: TestEndpointComponent}
];

const protectedRoutes: Routes = [
  { path: 'travels', component: TravelListComponent},
  { path: 'travels/new', component: TravelEditComponent },
  { path: 'travels/:travelID', component: TravelComponent },
  { path: 'travels/:travelID/invite', component: InviteComponent },
  { path: 'travels/:travelID/edit', component: TravelEditComponent },
  { path: 'travels/:travelID/expense/new', component: ExpenseEditComponent },
  { path: 'travels/:travelID/expense/:expenseID', component: ExpenseComponent },
  { path: 'travels/:travelID/expense/:expenseID/edit', component: ExpenseEditComponent },
  { path: 'travels/:travelID/participants/new', component: ParticipantEditComponent },
  { path: 'users/:userlID/invites', component: InviteListComponent },
  { path: 'users/:userlID', component: UserProfileComponent },
  // { path: 'users/:userlID/edit', component: UserEditComponent },
].map((route: Route) => {
  route.canActivate = [AuthGuard];
  return route;
});

export const allRoutes: Routes = routes.concat(protectedRoutes);

@NgModule({
  imports: [RouterModule.forRoot(allRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
