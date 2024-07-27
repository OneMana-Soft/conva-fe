import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage.tsx';

import {
  URL_ACTIVITY,
  URL_CHATS,
  URL_CHANNEL,
  URL_LOGIN,
  URL_PAGE_NOT_FOUND,
  URL_SEARCH,
  URL_ONBOARDING, URL_ADMIN,
} from './constants/routes/appNavigation';
import ProtectedRoutes from './utils/ProtectedRoutes.jsx';
import OnboardingRoutes from './utils/OnboardingRoutes.js';
import AuthLayout from './utils/AuthLayout.js';
import ChannelPage from './pages/Channel/ChannelPage.tsx';
import Chat from './pages/chat/ChatPage.tsx';
import Activity from './pages/Activity/Activity.js';
import GlobalSearch from './pages/GlobalSearch/GlobalSearch.js'
import OnboardingPage from './pages/Onboarding/OnboardingPage.js';
import WebSocket from "./components/Mqtt/WebSocket.tsx";
import PushNotification from "./components/PushNotification/PushNotification.tsx";
import AdminPage from "./pages/Admin/AdminPage.tsx";
import AdminLayout from "./utils/AdminLayout.tsx";
import NotFoundPage from "./pages/NotFound/NotFoundPage.tsx";
// import {getToken} from "firebase/messaging";
// import {messaging} from "./utils/firebaseConfig.ts";

function App() {
  const onboardingRoute = [{ component: OnboardingPage, path: URL_ONBOARDING }]
  const controlledRoutes = [{ component: ChannelPage, path: URL_CHANNEL + '/:channelId?/:postId?' },{ component: Chat, path: URL_CHATS + '/:dmId?/:chatId?' },{ component: Activity, path: URL_ACTIVITY },{ component: GlobalSearch, path: URL_SEARCH }];
  const publicRoutes = [{ component: LoginPage, path: URL_LOGIN}, {component: NotFoundPage, path: URL_PAGE_NOT_FOUND}];
  const adminRoutes = [{component: AdminPage, path: URL_ADMIN}]

  return (
    <main className='select-none relative bg-gray-50 dark:bg-gray-900 transition-colors duration-500'>
      <Routes>
        <Route element={<ProtectedRoutes />}>
          {controlledRoutes.map((item) => (
            <Route
              key={item.path}
              path={item.path}
              element={
                <AuthLayout>
                  <>
                    <WebSocket/>
                    <PushNotification/>
                    <item.component />
                  </>

                </AuthLayout>
              }
            />
          ))}
          {adminRoutes.map((item) => (
              <Route
                  key={item.path}
                  path={item.path}
                  element={
                    <AdminLayout>
                      <item.component />
                    </AdminLayout>
                  }
              />
          ))}
        </Route>
        <Route element={<OnboardingRoutes/>}>
          {onboardingRoute.map((item) => (
            <Route
              key={item.path}
              path={item.path}
              element={
               <item.component />
              }
            />
          ))}
        </Route>
        {publicRoutes.map((item) => {
          return (
            <Route
              key={item.path}
              path={item.path}
              element={<item.component />}
            />
          );
        })}
        <Route
          path='*'
          element={<Navigate to={URL_PAGE_NOT_FOUND} replace />}
        />
      </Routes>
    </main>
  );
}

export default App;
