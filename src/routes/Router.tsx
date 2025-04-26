import { lazy } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import RoleGuard from './RoleGuard'; // adjust path as needed
import BlankGuard from './BlankGuard';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

/* ***Auth Pages**** */
const Login2 = Loadable(lazy(() => import('../views/authentication/auth/Login')));
const Register2 = Loadable(lazy(() => import('../views/authentication/auth/Register')));
const ForgotPassword2 = Loadable(lazy(() => import('../views/authentication/auth/ForgotPassword')));
const TwoSteps2 = Loadable(lazy(() => import('../views/authentication/auth/TwoSteps')));
const Maintainance = Loadable(lazy(() => import('../views/authentication/Maintainance')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));

/* ***Protected Views**** */
const Dashboard1 = Loadable(lazy(() => import('../views/dashboard/Dashboard1')));
const Email = Loadable(lazy(() => import('../views/email/Email')));
const DNList = Loadable(lazy(() => import('../views/dnlist/DNList')));
const POList = Loadable(lazy(() => import('../views/dnlist/POList')));
const PODetail = Loadable(lazy(() => import('../views/podetail/PODetail')));
const OCRViewer =  Loadable(lazy(() => import('../views/ocrview')));
const NoteViewer = Loadable(lazy(()=>import('../views/notes/Notes')))
/* ***Router Config*** */
const Router = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      {
        path: '/',
        exact: true,
        element: (
          <RoleGuard role={['admin']}>
            <Dashboard1 />
          </RoleGuard>
        ),
      },
      {
        path: '/email',
        element: (
          <RoleGuard role={['admin', 'user']}>
            <Email /> 
          </RoleGuard>
        ),
      },
      {
        path: '/email/:emailID',
        element: (
          <RoleGuard role={['admin', 'user']}>
            <Email /> 
          </RoleGuard>
        ),
      },
      {
        path: '/ocr_viewer/:dn/:doc_type/:document',
        element: (
          <RoleGuard role={['admin', 'user']}>
            <OCRViewer /> 
          </RoleGuard>
        ),
      },
      {
        path: '/dn-list',
        element: (
          <RoleGuard role={['admin']}>
            <DNList />
          </RoleGuard>
        ),
      },
      {
        path: '/logsheet',
        element: (
          <RoleGuard role={['admin']}>
            <NoteViewer />
          </RoleGuard>
        ),
      },
      {
        path: '/dn-list/:dn',
        element: (
          <RoleGuard role={['admin']}>
            <POList />
          </RoleGuard>
        ),
      },
      {
        path: '/dn-list/:dn/:po',
        element: (
          <RoleGuard role={['admin']}>
            <PODetail />
          </RoleGuard>
        ),
      },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/',
    element: (
      <BlankGuard>
        <BlankLayout />
      </BlankGuard>
    ),
    children: [
      { path: '/auth/login', element: <Login2 /> },
      { path: '/auth/register', element: <Register2 /> },
      { path: '/auth/forgot-password', element: <ForgotPassword2 /> },
      { path: '/auth/two-steps', element: <TwoSteps2 /> },
      { path: '/auth/maintenance', element: <Maintainance /> },
      { path: '404', element: <Error /> },
      { path: '/auth/404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

const router = createBrowserRouter(Router);

export default router;
