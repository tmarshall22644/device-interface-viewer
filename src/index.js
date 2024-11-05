import { defaultConfiguration } from './default-configuration';
import fetchData from './fetch-data';
import settings from './settings';
import visualizations from './visualizations';
import { mapInputToConfig } from './map-input-to-config';

const widget = {
  defaultConfiguration,
  configToVariables: (configuration) => ({ 
    datasourceId: configuration.datasourceId,
    resources: configuration.resources,
    selectedDevice: configuration.selectedDevice,
    selectedIndicator: configuration.selectedIndicator,
    objType: configuration.objType,
    indicatorType: configuration.indicatorType,
    plugin: configuration.plugin,
    timeSpan: configuration.timeSpan,
    timeZone: configuration.timeZone,
    aggregate: configuration.aggregate }),
  mapInputToConfig,
  fetchData,
  settings,
  visualizations
};

export default widget;
