import { Page } from '@strapi/strapi/admin';
import { Routes, Route } from 'react-router-dom';

import { HomePage } from './HomePage';
import pluginPermissions from '../permissions';

const App = () => {
  return (
    <Page.Protect permissions={pluginPermissions.access}>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="*" element={<Page.Error />} />
      </Routes>
    </Page.Protect>
  );
};

export { App };
