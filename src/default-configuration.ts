import { ResourceSelection } from '@sevone/insight-connect';

type ResourceSelectionType = React.ComponentProps<typeof ResourceSelection>;

type SelectResourceType = ResourceSelectionType['value'];

type ResourceHierarchicalDataType = Array<SelectResourceType>;

export type RelativeTimeSpanType = {
  type: 'RELATIVE',
  relative: {
    range: string
  }
};

export type SpecificTimeSpanType = {
  type: 'SPECIFIC_INTERVAL',
  specificInterval: {
    start: number,
    end: number
  }
};

export type CustomRelativeTimeSpanType = {
  type: 'CUSTOM_RELATIVE',
  customRelative: {
    timeString: string
  }
}

export type TimeSpanType = RelativeTimeSpanType | SpecificTimeSpanType | CustomRelativeTimeSpanType;

export type ConfigurationType = {
  visualization: string,
  datasourceId: number | null,
  resources: Array<SelectResourceType>,
  hierarchicalData: ResourceSelectionType['hierarchicalData'],
  selectedDevice: string,
  timeSpan: TimeSpanType,
  timeZone: string,
  chartWidth: string,
  chartHeight: string,
  selectedIndicator: IndicatorType,
  objType: string,
  indicatorType: string,
  plugin: string,
  objTypes: Array<ObjectType>,
  selectedObjType: ObjectType,
  aggregate: boolean
}

export type IndicatorType = {
  value: number,
  label: string
}

export type ObjectType = {
  label: string,
  value: number,
  plugin: string,
  path: string
}

export type ResourceType = {
  type: 'INDICATOR_TYPE' | 'OBJECT' | 'OBJECT_TYPE' | 'DEVICE' | 'PLUGIN' | 'DEVICE_GROUP' | 'OBJECT_GROUP'
  value: number
  plugin?: number
  objectType?: number
  pluginValue?: number
  deviceValue?: number
  objectValue?: number
  hierarchicalData: ResourceHierarchicalDataType
}

const defaultConfiguration: ConfigurationType = {
  visualization: 'Line',
  datasourceId: null,
  resources: [],
  hierarchicalData: [],
  selectedDevice: '',
  timeSpan: {
    type: 'RELATIVE',
    relative: { range: 'PAST_24HOURS' }
  },
  timeZone: 'America/Chicago',
  chartWidth: '450',
  chartHeight: '300',
  selectedIndicator: {value: -1, label: 'In/Out Octets'},
  objType: 'Interface',
  indicatorType: '',
  plugin: 'SNMP',
  objTypes: [],
  selectedObjType: {value: 274, label: 'Interface', plugin: 'SNMP', path: 'Interface'},
  aggregate: true
}

export { defaultConfiguration };
