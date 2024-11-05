import React from 'react';
import { messages } from '@sevone/insight-wdk';
import { ConfigurationType } from '../../../default-configuration';
import { FormGroup, Input, Button, Checkbox } from '@sevone/scratch';

type Props = {
  configuration: ConfigurationType,
  onMessage: (msg: string, payload: any) => void
};

function Styles(props: Props) {
  const { configuration, onMessage } = props;
  const [chartWidth, setChartWidth] = React.useState(configuration.chartWidth);
  const [chartHeight, setChartHeight] = React.useState(configuration.chartHeight);

  const handleRunClick = () => {
    onMessage(messages.updateConfiguration, {
      chartWidth,
      chartHeight
    });
  };

  const handleAggregateChange = (value: boolean) => {
    onMessage(messages.updateConfiguration, {
      aggregate: value
    });
  }

  return (
    <div>
      <FormGroup>
        <Checkbox
          onChange={handleAggregateChange}
          checked={configuration.aggregate}
        >
          {'Aggregate Data'}
        </Checkbox>
        {/* <Input
          label={'Chart Width (px)'}
          value={chartWidth}
          onChange={setChartWidth}
        />
        <FormGroup>
          <Input
            label={'Chart Height (px)'}
            value={chartHeight}
            onChange={setChartHeight}
          />
        </FormGroup> */}
      </FormGroup>
      {/* <Button
        fullWidth
        disabled={isNaN(Number(chartWidth)) || isNaN(Number(chartHeight))}
        onClick={handleRunClick}
      >{'Update'}</Button> */}
    </div>

  );
}

Styles.title = 'Line Visualizations';

export { Styles };
