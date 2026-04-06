

import SignIn from '../components/authentication/signIn';
import Registration from '../components/authentication/registration';
import Forget from '../components/authentication/forget';
import Profile from '../components/profile/profilePage';
import Dashboard from '../components/profile/admin/dashboard/dashboard';
import Chicken from '../components/pages/poultry/Chicken/chicken';

const routes = {
    // Root page
    '/': SignIn,
    '/user-current': SignIn,
    '/new-user-create': Registration,
    '/forget': Forget,
    '/profile': Profile,
    '/dashboard': Dashboard,
    //Chicken module
    '/chicken': {
        component: Chicken,
        children: {
            breeds: Breeds,
            medicallogs: MedicalLogs
        }
    }

};

export default routes;