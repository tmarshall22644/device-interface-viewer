import React from 'react';
// import styled from 'styled-components';
import { FacetType, messages } from '@sevone/insight-wdk';
import { Button } from '@sevone/scratch';
import { ConfigurationType } from '../default-configuration';
import { ResourceSelection } from '@sevone/insight-connect';
import { resourcePaths } from './resource-paths';
import { consumedFacets } from '../../facets';
import { extend, isEmpty } from 'lodash-es';
import { defaultConfiguration } from '../default-configuration';

type ResourceSelectionType = React.ComponentProps<typeof ResourceSelection>;

type Props = {
  configuration: ConfigurationType,
  onMessage: (msg: string, payload: any) => void,
  facets: Array<FacetType>,
};

type State = {
  datasource: ResourceSelectionType['datasource'],
  value: ResourceSelectionType['value'],
  hierarchicalData: ResourceSelectionType['hierarchicalData']
};

class ResourceSettings extends React.Component<Props, State> {
  static title = 'Widget Data';

  constructor(props: Props) {
    super(props);
    this.state = {
      datasource: this.props.configuration.datasourceId,
      value: !isEmpty(this.props.configuration.resources) ? this.props.configuration.resources[0] : null,
      hierarchicalData: this.props.configuration.hierarchicalData
    }
    const { configuration, onMessage } = this.props;
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleChange(datasource, value, hierarchicalData) {
    // console.log('datasource: ', datasource);
    // console.log('value: ', value);
    // console.log('hierData: ', hierarchicalData);

    this.setState({ datasource, value, hierarchicalData });
  }

  handleClick() {
    const { configuration, onMessage } = this.props;
    const { datasource, value, hierarchicalData } = this.state;
    const datasourceId = Array.isArray(datasource) ? datasource[0] : datasource;
    // console.log('ds: ', datasourceId);
    // console.log('value_config: ', value);
    // console.log('heir: ', hierarchicalData);
    // console.log('resource: ', value?.resources[0].value);

    const updateObj = {
      datasourceId,
      resources: [value],
      hierarchicalData
    };

    if (value?.type === 'DEVICE') {
      updateObj['selectedDevice'] = value.resources[0].value;
      updateObj['plugin'] = defaultConfiguration.plugin;
      updateObj['objType'] = defaultConfiguration.objType;
      updateObj['indicatorType'] = '';
      updateObj['selectedIndicator'] = defaultConfiguration.selectedIndicator;
    } else if (value?.type === 'OBJECT_TYPE') {
      const plugin = value.resources[0].plugin.value;
      // console.log('plugin: ', plugin);
      const len = value.resources[0].value.length;
      const objType = value.resources[0].value[len - 1];
      // console.log('OT: ', objType);
      const selectedDevice = hierarchicalData[0].resources[0].value;
      // console.log('device: ', selectedDevice);

      updateObj['selectedDevice'] = selectedDevice;
      updateObj['plugin'] = plugin;
      updateObj['objType'] = objType;
      updateObj['indicatorType'] = '';
      updateObj['selectedIndicator'] = defaultConfiguration.selectedIndicator;
    } else if (value?.type === 'INDICATOR_TYPE') {
      const indType = value.resources[0].value;
      // console.log('IT: ', indType);
      const plugin = value.resources[0].objectType.plugin.value;
      // console.log('plugin: ', plugin);
      const len = value.resources[0].objectType.value.length;
      const objType = value.resources[0].objectType.value[len - 1];
      // console.log('OT: ', objType);
      const selectedDevice = hierarchicalData[0].resources[0].value;
      // console.log('device: ', selectedDevice);

      updateObj['selectedDevice'] = selectedDevice;
      updateObj['plugin'] = plugin;
      updateObj['objType'] = objType;
      updateObj['indicatorType'] = indType;
      updateObj['selectedIndicator'] = { value: 0, label: ''}
    }
    onMessage(messages.updateConfiguration, updateObj);
  }

  handleObjTypeChange = (selectedObjType) => {
    const { configuration, onMessage } = this.props;
    onMessage(messages.updateConfiguration, {
      selectedObjType
    });
  }

  render() {
    const { datasource, value, hierarchicalData } = this.state;
    return (
      <div>
        <ResourceSelection
          allowedPaths={resourcePaths}
          datasource={datasource}
          value={value}
          hierarchicalData={hierarchicalData}
          onChange={this.handleChange}
        />
        <Button
          fullWidth={true}
          onClick={this.handleClick}
          disabled={(isEmpty(value) ? true : value?.resources.length === 0 ? true : value?.type === 'PLUGIN' ? true : value?.resources.length === 1 ? false : true)}
        >{'Run'}</Button>
      </div>
    );
  }
}

export default ResourceSettings;
