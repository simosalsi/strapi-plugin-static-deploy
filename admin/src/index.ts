import pluginPackage from '../../package.json';
import { PLUGIN_ID } from './pluginId';
import { PluginIcon } from './components/PluginIcon';
import pluginPermissions from './permissions';

const name = pluginPackage.strapi.displayName;

export default {
  register(app: any) {
    app.addMenuLink({
      to: `${PLUGIN_ID}`,
      icon: PluginIcon,
      permissions: pluginPermissions.access,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: name,
      },
      Component: async () => {
        const { App } = await import('./pages/App');
        return App;
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      name: PLUGIN_ID,
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
