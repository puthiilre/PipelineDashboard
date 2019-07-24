// Third party modules
import { firestore, CloudFunction, EventContext } from 'firebase-functions';

// Dashboard hub firebase functions models/mappers
import { Logger } from '../client/logger';
import { DocumentData, DocumentSnapshot, FirebaseAdmin, WriteResult } from './../client/firebase-admin';

export const onDeleteProjectRepositories: CloudFunction<DocumentSnapshot> = firestore
  .document('projects/{projectUid}')
  .onDelete(async (projectSnapshot: DocumentSnapshot, context: EventContext) => {

    try {
      const project: DocumentData = projectSnapshot.data();

      if (Array.isArray(project.repositories) && project.repositories.length > 0) {

        const promiseList: Promise<WriteResult>[] = [];

        for (const repositoryUid of project.repositories) {
          const repoData: DocumentData = (await FirebaseAdmin.firestore().collection('repositories').doc(repositoryUid).get()).data();

          if (Array.isArray(repoData.projects)) {
            repoData.projects = repoData.projects.filter((element: string) => element !== context.params.projectUid);
          } else {
            repoData.projects = [];
          }

          const repo: Promise<WriteResult> = FirebaseAdmin.firestore().collection('repositories').doc(repositoryUid).update(repoData);
          promiseList.push(repo);
        }

        await Promise.all(promiseList);
      }

      return;

    } catch (err) {
      Logger.error(err);
      throw new Error(err);
    }

  });