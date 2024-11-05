import { facetManager } from '@sevone/insight-wdk';
import { consumedFacets as schemas } from '../facets';
import { ConfigurationType } from './default-configuration';
import { RelativeTimeSpanType, SpecificTimeSpanType, CustomRelativeTimeSpanType } from './default-configuration';

type FacetType<T = any> = ReturnType<typeof facetManager.createFacet> & {
  data: T
};

function mapInputToConfig(
  prevInput,
  nextInput: { facets?: Array<FacetType>},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  config: ConfigurationType
): Partial<ConfigurationType> | null {
  if (!nextInput.facets) {
    return null;
  }

  const { isSchemaCompatible } = facetManager;
  const configPatch: Partial<ConfigurationType> = {};

  nextInput.facets.forEach((facet) => {
    if (!facet.data) {
      return;
    }
    // console.log("facet", facet);
    if (isSchemaCompatible(facet.schema, schemas.resources)) {
      if (facet.data.type === 'DEVICE') {
        configPatch.resources = [ facet.data ];
        configPatch.selectedDevice = facet.data.resources[0].value;
      }
    } else if (isSchemaCompatible(facet.schema, schemas.timespanV2)) {
      // console.log('timespan facet: ', facet);
      configPatch.timeZone = facet.data.timezone;
      if ('timespan' in facet.data) {
        //relative timespan
        const ts: RelativeTimeSpanType = {
          type: 'RELATIVE',
          relative: {
            range: facet.data.timespan
          }
        };
        configPatch.timeSpan = ts;
      } else if ('startTime' in facet.data) {
        //specific timespan
        const ts: SpecificTimeSpanType = {
          type: 'SPECIFIC_INTERVAL',
          specificInterval: {
            start: facet.data.startTime,
            end: facet.data.endTime
          }
        };
        configPatch.timeSpan = ts;
      } else if ('timeString' in facet.data) {
        //custom timespan
        const ts: CustomRelativeTimeSpanType = {
          type: 'CUSTOM_RELATIVE',
          customRelative: {
            timeString: facet.data.timeString
          }
        };
        configPatch.timeSpan = ts;
      }
    } else if (isSchemaCompatible(facet.schema, schemas.datasource)) {
      configPatch.datasourceId = facet.data.datasource;
    } else { 
      console.log('chosen facet type not consumable: ', facet);
    }
  });

  return configPatch;
}

export { mapInputToConfig };
