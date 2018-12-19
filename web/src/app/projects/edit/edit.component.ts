import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { ProjectService } from '../../../services/project.service';
import { catchError } from 'rxjs/operators';
import { ProjectModel, RepositoryModel } from '../../../models/index.model';
import { Observable, Subscription } from 'rxjs';
import { GitHubRepositoryService } from '../../../services/github/index.services';

@Component({
    selector: 'dashboard-projects-edit',
    templateUrl: './edit.component.html',
})
export class EditProjectComponent implements OnInit {

    private projectSubscription: Subscription;
    private saveSubscription: Subscription;
    private repositorySubscription: Subscription;
    public uid: string;
    public projectForm: FormGroup;
    public repositories: RepositoryModel[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private form: FormBuilder,
        private snackBar: MatSnackBar,
        private projectService: ProjectService,
        private repositoryService: GitHubRepositoryService,
    ) {
        this.uid = this.route.snapshot.paramMap.get('uid');
    }

    ngOnInit(): void {
        this.projectForm = this.form.group({
            type: [undefined, [Validators.required]],
            title: [undefined, [Validators.required, Validators.minLength(3), Validators.maxLength(32)]],
            description: [undefined, [Validators.minLength(3), Validators.maxLength(1024)]],
        });

        this.projectSubscription = this.projectService
            .findOneById(this.uid)
            .subscribe((project: ProjectModel) => this.projectForm.reset(project));
    }

    save(): void {
        this.saveSubscription = this.projectService
            .save({ uid: this.uid, ...this.projectForm.getRawValue() })
            .pipe(
                catchError((error: any): any => this.snackBar.open(error.message, undefined, { duration: 5000 }))
            )
            .subscribe(() => this.router.navigate(['/project', this.uid]));
    }

    ngDestroy(): void {
        this.projectSubscription
            .unsubscribe();
        this.saveSubscription
            .unsubscribe();
    }
}