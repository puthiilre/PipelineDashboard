import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { filter, tap, switchMap } from 'rxjs/operators';

// Dashboard hub models
import { ProjectModel } from '../../shared/models/index.model';

// Dashboard hub dialog component
import { DialogListComponent } from '../../shared/dialog/list/dialog-list.component';

// Dashboard hub services
import { AuthenticationService, ProjectService, RepositoryService } from '../../core/services/index.service';

@Component({
  selector: 'dashboard-projects-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})

export class ViewProjectComponent implements OnInit {
  private projectSubscription: Subscription;
  private deleteSubscription: Subscription;
  private repositorySubscription: Subscription;
  public project: ProjectModel = new ProjectModel();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private projectService: ProjectService,
    private repositoryService: RepositoryService,
    private authService: AuthenticationService,
  ) {
    this.project.uid = this.route.snapshot.paramMap.get('uid');
  }

  ngOnInit(): void {
    this.projectSubscription = this.projectService
      .findOneById(this.route.snapshot.params.uid)
      .subscribe((project: ProjectModel) => this.project = project);
  }

  // This function add  the repository
  addRepository(): void {
    this.dialog
      .open(DialogListComponent, {
        data: {
          project: this.project,
          repositories: this.authService.profile.repositories
        }
      })
      .afterClosed()
      .pipe(
        filter((selectedRepositories: { value: string }[]) => !!selectedRepositories),
      )
      .subscribe((selectedRepositories: { value: string }[]) => {
        this.projectService.saveRepositories(
          this.project.uid,
          selectedRepositories.map((fullName: { value: string }) => fullName.value)
        )
          // @TODO: need to nest subscribes because already using 2 nested pipes :( - required imorovement to stop page flicker
          .subscribe(() => {});
      });
  }

  // This function delete the project
  delete(): void {
    this.deleteSubscription = this.projectService
      .delete(this.project.uid)
      .subscribe(() => this.router.navigate(['/projects']));
  }

  // This function check if logged in user is also owner of the project
  isAdmin(): boolean {
    return this.projectService.isAdmin(this.project);
  }

  ngDestroy(): void {
    this.projectSubscription.unsubscribe();
    this.deleteSubscription.unsubscribe();
    this.repositorySubscription.unsubscribe();
  }
}
