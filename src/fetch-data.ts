import { request } from "@sevone/insight-connect";
import { ResourceType } from "./default-configuration";
import { TimeSpanType } from "./default-configuration";
import { IndicatorType } from "./default-configuration";
import { ObjectType } from "./default-configuration";
import { defaultConfiguration } from './default-configuration';

type VariablesType = {
  datasourceId: number | null,
  resources: Array<ResourceType>,
  selectedDevice: string,
  selectedIndicator: IndicatorType,
  objType: string,
  indicatorType: string,
  plugin: string,
  timeSpan: TimeSpanType,
  timeZone: string,
  aggregate: boolean
};

export type DataType = {
  error?: string | null,
  data?: {}
  // data: {
  //   datasource: string,
  //   datasourceId: number | null,
  //   resources: Array<ResourceType>,
  //   selectedDevice: string
  // }
};

const getDeviceQuery = `query ($datasourceId: Int, $device: [String!]) {
  devices (datasourceId: $datasourceId, filter: {deviceNames: $device}) {
    id
    name
    ipAddress
    name
    pollFrequency
  }
}`;

let deviceObjectTypesQuery = `query ($datasourceId: Int, $device: [Int!], $objName: [String!], $plugin: String) {
  objectTypes (datasourceId: $datasourceId, filter: {deviceIds: $device, names: $objName, pluginObjectName: $plugin}, size: 1000) {
    id
    name
    path
    plugin {
      objectName
    }
  }
}`;

let deviceIndicatorTypeQuery = `query ($datasourceId: Int, $deviceId: Int, $objPath: [String!]!) {
  indicatorTypes (datasourceId: $datasourceId, size:1000, filter: {objectTypePaths: {path: $objPath}, indicatorFilter: {deviceId: $deviceId}}) {
    id
    name
    description
    objectTypeId
  }
}`;

let deviceMetricQuery = `query ($datasourceId: Int, $device: [Int!], $objTypeId: [Int!], $indicatorIds: [Int!], $indicatorNames: [String!], $timeSpan: PMTimeSpanArgs, $timeZone: String, $aggregate: Boolean) {
  pm ( 
    datasourceId: $datasourceId
    resources: [{deviceIds: $device, objectTypeIds: $objTypeId, indicatorTypeIds: $indicatorIds, indicatorTypeNames: $indicatorNames}]
    timeSpan: $timeSpan
    timeZone: $timeZone
    downsampleSettings: {disabled: false, viewportWidth: 350, viewportHeight: 200}
    aggregation: {enable: $aggregate, type: AVERAGE}
  )
  {
    aggregation {
      period
      units
    }
    timeRanges {
      startTime
      endTime
    }
    indicators {
      deviceId
      deviceName
      indicatorId
      indicatorTypeId
      indicatorName: indicatorTypeName
      indicatorTypeDescription
      objectName
      objectDescription
      objectTypePath
      objectTypeId
      pluginObjectName
      indicatorData {
        data {
          time
          value
        }
        postData {
          time
          value
        }
        preData {
          time
          value
        }
        total
        avgY
        maxX
        minX
        maxY
        minY
        maxYCap
        unit
      }
    }
  }
}`;

let currVars: VariablesType;
let prevVars: VariablesType = {
  datasourceId: null,
  resources: [],
  selectedDevice: '',
  selectedIndicator: { value: 0, label: '' },
  objType: '',
  indicatorType: '',
  plugin: '',
  timeSpan: { type: 'RELATIVE', relative: { range: '' } },
  timeZone: '',
  aggregate: true
};
let selectedDeviceId: number;
let selectedObjType: ObjectType;
let indicators = {};
let indicatorArray: { value: any; label: string; }[] = [];
const fetch_data = {};

async function fetchData(variables: VariablesType): Promise<DataType> {

  currVars = variables;
  console.log('previous variables: ', prevVars);
  console.log('current variables: ', currVars);

  if (!variables.selectedDevice) {
    prevVars = variables;
    return new Promise((resolve) => resolve({
      error: null,
      data: { noDevice: true }
    }));
  }

  fetch_data['datasourceId'] = variables.datasourceId;
  fetch_data['resources'] = variables.resources;
  fetch_data['selectedDevice'] = variables.selectedDevice;
  fetch_data['plugin'] = variables.plugin;

  // if (currVars.selectedDevice !== prevVars.selectedDevice || currVars.datasourceId !== prevVars.datasourceId) { //only run device summary query when we change devices or datasource
    //get devices
    const deviceVars = { device: [variables.selectedDevice], datasourceId: variables.datasourceId }
    const getDevice_response = await request.query(getDeviceQuery, deviceVars);
    console.log('device summary data response: ', getDevice_response);

    if ('errors' in getDevice_response.data) {
      prevVars = variables;
      return new Promise((resolve) => resolve({
        error: getDevice_response.data.errors[0].code + ': ' + getDevice_response.data.errors[0].message,
        data: {}
      }));
    }

    if (getDevice_response.data.data.devices.length === 0) {
      prevVars = variables;
      return new Promise((resolve) => resolve({
        error: null,
        data: { error: `No data found for device ${variables.selectedDevice}. Please select another device.` }
      }));
    }

    fetch_data['ipAddr'] = getDevice_response.data.data.devices[0].ipAddress;

    selectedDeviceId = getDevice_response.data.data.devices[0].id;
  // }
  console.log('devId: ', selectedDeviceId);
  if (currVars.selectedDevice !== prevVars.selectedDevice || currVars.datasourceId !== prevVars.datasourceId || currVars.objType !== prevVars.objType) { //only run object type query when we change devices or datasource or object type
    //device object types fetch
    const objTypeVars = { datasourceId: variables.datasourceId, device: [selectedDeviceId], objName: [variables.objType], plugin: variables.plugin };
    const objTypes_response = await request.query(deviceObjectTypesQuery, objTypeVars);
    console.log('device obj type query response: ', objTypes_response);

    if ('errors' in objTypes_response.data) {
      prevVars = variables;
      return new Promise((resolve) => resolve({
        error: objTypes_response.data.errors[0].code + ': ' + objTypes_response.data.errors[0].message,
        data: {}
      }));
    }

    if (objTypes_response.data.data.objectTypes.length === 0) {
      prevVars = variables;
      return new Promise((resolve) => resolve({
        error: null,
        data: { error: `${variables.selectedDevice} does not have data for object type ${variables.objType}. Please select another device.` }
      }));
    }

    let i = 0;
    while (i < objTypes_response.data.data.objectTypes.length) {
      if (objTypes_response.data.data.objectTypes[i].name === variables.objType) {
        const ot = objTypes_response.data.data.objectTypes[i];
        selectedObjType = {
          value: ot.id,
          label: ot.name,
          plugin: ot.plugin.objectName,
          path: ot.path
        }
        console.log('object type: ', selectedObjType);
      }
      i++;
    }

    fetch_data['objectType'] = selectedObjType.label;
  }


  if (currVars.selectedDevice !== prevVars.selectedDevice || currVars.datasourceId !== prevVars.datasourceId || currVars.objType !== prevVars.objType) { //only run indicator types query when we change devices or datasource or object types
    //device indicator types fetch
    const indTypeVars = { datasourceId: variables.datasourceId, deviceId: selectedDeviceId, objPath: selectedObjType.path };
    const indType_response = await request.query(deviceIndicatorTypeQuery, indTypeVars);
    console.log('device indicator type query response: ', indType_response);

    indicators = {};
    if (selectedObjType.value === 274)
      indicators['In/Out Octets'] = -1;

    if ('errors' in indType_response.data) {
      prevVars = variables;
      return new Promise((resolve) => resolve({
        error: indType_response.data.errors[0].code + ': ' + indType_response.data.errors[0].message,
        data: {}
      }));
    }

    if (indType_response.data.data.indicatorTypes.length === 0) {
      prevVars = variables;
      return new Promise((resolve) => resolve({
        error: null,
        data: { error: `${variables.selectedDevice} does not have data for object type ${selectedObjType.label}. Please select another device.` }
      }));
    }

    indType_response.data.data.indicatorTypes.forEach(indicatorType => {
      if (indicatorType.objectTypeId === selectedObjType.value)
        indicators[indicatorType.description] = indicatorType.id;
    });
    // console.log('inds: ', indicators);
    const indKeys_sorted = Object.keys(indicators).sort();
    indicatorArray = indKeys_sorted.map(function (indicator) {
      return { value: indicators[indicator], label: indicator };
    });

    fetch_data['indicators'] = indicatorArray;
  }

  let selectedInd = { value: 0, label: ''};
  if (!(currVars.selectedIndicator.label in indicators)) {
    if (currVars.objType === defaultConfiguration.objType && currVars.selectedIndicator.value === defaultConfiguration.selectedIndicator.value && currVars.selectedIndicator.label === defaultConfiguration.selectedIndicator.label)
      selectedInd = currVars.selectedIndicator;
    else
      selectedInd = indicatorArray[0];
    // console.log('indicator not in list');
  } else
    selectedInd = currVars.selectedIndicator;
  console.log('indicator: ', selectedInd);

  //device metric data fetch
  const objTypeId = selectedObjType.value; //274 - interface
  let indicatorNames: string[] = [];
  let indicatorIds: number[] = [];
  if (currVars.selectedIndicator.value === 0 && currVars.selectedIndicator.label === '')
    indicatorNames = [currVars.indicatorType]
  else if (selectedInd.value === -1)
    indicatorNames = ["InOctet", "OutOctet"];
  else
    indicatorIds = [selectedInd.value];
  const metricQueryVars = {
    datasourceId: variables.datasourceId,
    device: [selectedDeviceId],
    objTypeId: [objTypeId],
    indicatorIds: indicatorIds,
    indicatorNames: indicatorNames,
    timeSpan: variables.timeSpan,
    timeZone: variables.timeZone,
    aggregate: variables.aggregate
  };
  const metric_response = await request.query(deviceMetricQuery, metricQueryVars);
  console.log('device metric data response: ', metric_response);

  if ('errors' in metric_response.data) {
    prevVars = variables;
    return new Promise((resolve) => resolve({
      error: metric_response.data.errors[0].code + ': ' + metric_response.data.errors[0].message,
      data: {}
    }));
  }

  let pm = { timeRanges: metric_response.data.data.pm.timeRanges, indicators: {} };
  metric_response.data.data.pm.indicators.forEach(indicator => {
    if (selectedInd.value === -1) {
      if (indicator.indicatorName.includes('InOctet')) { //In Octets
        if (indicator.objectName in pm.indicators)
          pm['indicators'][indicator.objectName]['in'] = indicator;
        else
          pm['indicators'][indicator.objectName] = { in: indicator };
      } else if (indicator.indicatorName.includes('OutOctet')) { //Out Octets
        if (indicator.objectName in pm.indicators)
          pm['indicators'][indicator.objectName]['out'] = indicator;
        else
          pm['indicators'][indicator.objectName] = { out: indicator };
      }
    } else {
      pm['indicators'][indicator.objectName] = indicator;
    }
  });

  if (currVars.selectedIndicator.value === 0 && currVars.selectedIndicator.label === '') {
    if (metric_response.data.data.pm.indicators.length === 0)
      fetch_data['selectedIndicator'] = { value: 0, label: variables.indicatorType }
    else {
      fetch_data['selectedIndicator'] = { value: metric_response.data.data.pm.indicators[0].indicatorTypeId, label: metric_response.data.data.pm.indicators[0].indicatorTypeDescription };
    }
  } else {
    fetch_data['selectedIndicator'] = selectedInd;
  }
  // console.log('fetch data ind: ', fetch_data['selectedIndicator']);

  let indInList = false;
  if (fetch_data['selectedIndicator']['label'] in indicators)
    indInList = true;

  fetch_data['pm'] = pm;
  fetch_data['indicatorInList'] = indInList;

  prevVars = variables;
  return new Promise((resolve) => resolve({
    error: null,
    data: fetch_data
  }));
}

export default fetchData;
