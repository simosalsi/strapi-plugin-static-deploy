# Strapi V5 Plugin - Deploy Static Site

Trigger Github workflows to build and deploy statically generated websites

## Work in Progress
This plugin is still very much a work in progress.

The only reason it's already published is due to time constraints of a work project.

Appropriate documentation will come with version 1.0.0.

## Roadmap
- Handle permissions (currently, any user can trigger a deployment) ✅
- Show history of deployments / workflows triggered ✅
- Filter deployment history by `environment` ✅
- **Optional:** Implement toasts for user feedback (although alerts are kinda nice because they force you to read and click to dismiss them) ✅
- Generalize the `environment` parameter to an `inputs` array and allow users to configure whether they want to filter deployment history by any of them
- Add email notifications on workflow trigger ✅
- Add email notifications on workflow completion
- Documentation + Release 1.0.0 + Submit plugin to Strapi Market

### Possible further enhancements
- Confirmation pop-up before triggering deployment ✅
- Automatic refresh of the history of deployments after trigger ✅
- Link to workflow run's github page ✅
- Allow multiple workflows
- Add the option to include a mandatory staging workflow before any workflow ✅
- Allow configuration of specific content types list to monitor for updates when determining staging status (currently disables production deployment after ANY publish action)
- Split each email notification trigger (staging trigger, prod trigger, staging workflow end, prod workflow end) to allow for finer configuration

## Credits
This plugin was born as a Strapi V5-compatible version of [Update Static Content](https://github.com/everythinginjs/strapi-plugin-update-static-content) by [Amir Mahmoudi](https://github.com/everythinginjs)

## License
MIT