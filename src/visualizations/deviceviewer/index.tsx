import React, { useState, useEffect, useRef } from 'react';
import settings from './settings';
import icon from '../../assets/icons/generic.svg';
import { ConfigurationType } from '../../default-configuration';
import { LineChart } from '@sevone/insight-charts';
import { Message, IconButton, AddIcon, MinusIcon, RemoveIcon } from '@sevone/scratch';
import { useTheme } from '@sevone/insight-connect';
import { messages } from '@sevone/insight-wdk';
import Slider from './slider';
import Select from 'react-select';
import ReactECharts from 'echarts-for-react';
import { InView, useInView } from 'react-intersection-observer';

type Props = {
  configuration: ConfigurationType,
  onMessage: (msg: string, payload: any) => void,
  data: any
};

// Custom SevOne-like theme for ECharts
const sevOneTheme = {
  color: ['#0088ff', '#ff6600', '#00aa44', '#ff0000', '#aa00cc', '#ffd700'],
  textStyle: {
    color: '#333',
  },
  axisLine: {
    lineStyle: {
      color: '#aaa',
    },
  },
};

let showFloatChart: boolean = false;

function DeviceViewer(props: Props) {
  const { data, configuration, onMessage } = props;
  const { theme } = useTheme();
  const [selected_indicator, setIndicator] = React.useState('');
  const [sliderValue, setSliderValue] = useState((Number(configuration.chartWidth) - 350) / 100);
  const lightVector = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAzklEQVR4AbWWUQrEIAxEw150vVlz01mFyhZpa6IzAxVqhPc+NGp2BsBRv6+J0xiNNU42eI9M4oT3HHdwmcQA/0vUoeA+NIkHeEvpC2QSU/hlIV0iDFdIpOFMiWU4Q2IbviNBg69I0OEZCRk8IiGHByT08KREMWUmEsWS+Vg+WKzt52XDXaN5TwThGokXeIH6PYHAOZdJINFk6BJY6HA0CWy0120JEHr7sgSIF0tagglPSyjgYQklPCRRB1fCJxLei66EP0j4WHQlfJDw/v8D1BSoVtGl4YcAAAAASUVORK5CYII="
  const darkVector = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABXklEQVR4AbWXwXGDMBBFV94a4Jxc4eIW3IE7CKnMcgdJCekgOcA5OVME2fWgjGIjIa1Wf0aDZTG8Zy0SGGBN3/cXai9QOcxgluujg9NhoHZu2/Z7nucvqJD1B1pqR+I8EefdeHA/wziOV1CMB/djD8uyfGycbzXLEYADs5Gm4bNpmh9jzPluXKUcEfjrNE32dg/UktiD82d0X2pLpMD/CWhKpMIfBDQkcuCbAiUSufCggERCAo8K5EhI4RwDCem6biCJy8bQsB4tCODJAjsSIIVzEBITKYcYniWQIpEL5xwgMwRfJGOhZM1A6G73kr1tJwskwEUSSasgts5vFwks0ZSXmt0Z2NtkSp8dWAJ3/RIJLIWXSqAGvEQCteBSCdSESyRQG54rgTXgORKmFtxP7H2CH0anmnAOX8vtmnc58T+jN5qOZ+oca8BdNspxpa16+DuBSmF5qqBymMEs1/8FWd6w/YuoGWUAAAAASUVORK5CYII="

  // const backgroundColor = isDarkMode ? theme.primary4.color : theme.primary1.contrast;
  let backgroundColor;
  let borderColor;
  let vectorColor;
  if (theme.primary4.color === '#ffffff') {
    backgroundColor = '#f6f6f6';
    borderColor = '3px solid rgb(43,43,43)';
    vectorColor = darkVector;
  }
  else if (theme.primary4.color === '#2b2b2b') {
    backgroundColor = '#333333';
    borderColor = '3px solid rgb(193,193,193)';
    vectorColor = lightVector;
  }

  const isDarkBackground = backgroundColor === '#333333';
  const isLightBackground = backgroundColor === '#f6f6f6';
  const textColor = {
    color: isDarkBackground ? '#ffffff' : (isLightBackground ? '#2b2b2b' : '#ffffff')
  };
  const titleStyle = { fontSize: 20 };
  Object.assign(titleStyle, textColor);
  const subTitleStyle = { fontSize: 14 };
  Object.assign(subTitleStyle, textColor);

  console.log('data from fetch: ', data);

  if (data.error) {
    return <Message type="error">{data.error}</Message>;
  }

  if ('error' in data.data) {
    return <Message type="info">{data.data.error}</Message>;
  }

  if (!data.data.selectedDevice || 'noDevice' in data.data) {
    return <Message type="info">{'No data to display. Please select a device.'}</Message>;
  }

  // if (data.data.indicators.length === 0)
  //   return <Message type='info'>{`${data.data.selectedDevice} has no indicator data to display. Please select another object type or device.`}</Message>

  const isMaxWidth = Number(configuration.chartWidth) >= 850;
  const isMaxHeight = Number(configuration.chartHeight) >= 700;
  const isMinWidth = Number(configuration.chartWidth) <= 350;
  const isMinHeight = Number(configuration.chartHeight) <= 200;

  const scale = 100; // scale charts in px
  const char_limit = 100; // char limit for object description in chart subtitle
  let time_start = data.data.pm.timeRanges[0].startTime;
  let time_end = data.data.pm.timeRanges[0].endTime;
  const indicatorList = Object.keys(data.data.pm.indicators);
  let showCount: number = indicatorList.length;

  const handleIndicatorChange = (selectedIndicator) => {
    console.log('indicator: ', selectedIndicator);
    onMessage(messages.updateConfiguration, {
      selectedIndicator
    });
  }

  const handleSliderChange = (newValue) => {
    setSliderValue(newValue);

    // Calculate the new chart size based on the slider value
    const newWidth = 350 + newValue * 100;
    const newHeight = 200 + newValue * 100;

    // Update the configuration to the new chart size
    onMessage(messages.updateConfiguration, {
      chartWidth: newWidth.toString(),
      chartHeight: newHeight.toString(),
    });
  };

  // const handleRelease = (releasedValue) => {
  //   setSliderValue(releasedValue);
  // }

  function handleMinusClick() {
    let cw = Number(configuration.chartWidth);
    let ch = Number(configuration.chartHeight);
    if (cw > 350 && ch > 200) {
      cw -= scale;
      ch -= scale;
    }

    onMessage(messages.updateConfiguration, {
      chartWidth: cw.toString(),
      chartHeight: ch.toString(),
    });

    // Calculate the new slider value and update it
    const newSliderValue = (cw - 350) / 100;
    setSliderValue(newSliderValue);
  }

  function handleAddClick() {
    let cw = Number(configuration.chartWidth);
    let ch = Number(configuration.chartHeight);
    if (cw < 850 && ch < 700) {
      cw += scale;
      ch += scale;
    }

    onMessage(messages.updateConfiguration, {
      chartWidth: cw.toString(),
      chartHeight: ch.toString(),
    });

    // Calculate the new slider value and update it
    const newSliderValue = (cw - 350) / 100;
    setSliderValue(newSliderValue);
  }

  function handleRemoveClick() {
    let floatDiv = document.getElementById('floatingChart');
    if (floatDiv === null)
      return;
    floatDiv.style.display = 'none';

    let overlay = document.getElementById('overlay');
    if (overlay === null)
      return;
    overlay.style.display = 'none';
    showFloatChart = false;
    setIndicator('');
  }

  function searchCharts(obj) {
    showCount = 0;
    const searchObj = obj.toLowerCase();
    let showObjSpan = document.getElementById('showObj');
    if (showObjSpan === null)
      return;

    if (obj === '') {
      indicatorList.forEach(objName => {
        let objDiv = document.getElementById(objName);
        if (objDiv === null)
          return;

        objDiv.style.display = 'block';
      });
      showCount = indicatorList.length;
      showObjSpan.textContent = showCount.toString();
      return;
    }

    indicatorList.forEach(objName => {
      let objDiv = document.getElementById(objName);
      if (objDiv === null)
        return;

      // search object name and object description
      if (!objName.toLowerCase().includes(searchObj)) {
        if (configuration.selectedIndicator.value === -1) {
          if (data.data.pm.indicators[objName]['in']['objectDescription'].toLowerCase().includes(searchObj)) {
            objDiv.style.display = 'block';
            showCount++;
          }
          else
            objDiv.style.display = 'none';
        } else {
          if (data.data.pm.indicators[objName]['objectDescription'].toLowerCase().includes(searchObj)) {
            objDiv.style.display = 'block';
            showCount++;
          }
          else
            objDiv.style.display = 'none';
        }
      } else {
        objDiv.style.display = 'block';
        showCount++;
      }
    });
    showObjSpan.textContent = showCount.toString();
  }

  const handleClick = () => {
    let searchObj = document.getElementById('searchTxt') as HTMLInputElement;
    if (searchObj === null)
      return;
    searchObj.value = '';
    searchCharts('');
  };

  function float_chart() {
    if (!showFloatChart)
      return null;

    if (!selected_indicator || selected_indicator === '')
      return null;

    let overlay = document.getElementById('overlay');
    if (overlay === null) {
      return null;
    }
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent background
    overlay.style.backdropFilter = 'blur(10px)'; // Apply the blur effect
    overlay.style.zIndex = '9999997';
    overlay.style.display = 'block';


    let floatChartDiv = document.getElementById('floatingChart');
    if (floatChartDiv === null) {
      return null;
    }

    floatChartDiv.style.zIndex = '9999998';
    floatChartDiv.style.backgroundColor = backgroundColor; // Set the background color based on the current mode
    floatChartDiv.style.display = 'block';
    floatChartDiv.style.padding = '10px';
    floatChartDiv.style.border = borderColor;
    const indicator = data.data.pm.indicators[selected_indicator];

    let maxY: number;
    if (data.data.selectedIndicator.value === -1)
      maxY = Math.max(indicator.in.indicatorData.maxY, indicator.out.indicatorData.maxY);
    else
      maxY = indicator.indicatorData.maxY;
    let scale = 1;
    let prefix = '';

    if (maxY > 999 && maxY < 1000000) {
      prefix = 'k';
      scale = 1000;
    } else if (maxY > 999999 && maxY < 1000000000) {
      prefix = 'M';
      scale = 1000000;
    } else if (maxY > 999999999) {
      prefix = 'G';
      scale = 1000000000;
    }

    if (data.data.selectedIndicator.value === -1) {
      return <ReactECharts
        option={{
          xAxis: {
            type: 'time',
            min: time_start,
            max: time_end,
            axisLabel: {
              textStyle: textColor,
              formatter: (value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
              },
            },
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: (maxY * 1.1) / scale,
            axisLabel: {
              formatter: (value) => maxY < 1 && maxY > 0 ? Number(value).toFixed(3) : Number(value).toFixed(2),
              textStyle: textColor
            },
            axisLine: {
              lineStyle: {
                color: '#aaa',
              },
            },
          },
          tooltip: {
            trigger: 'axis',
            show: true
          },
          toolbox: {
            feature: {
              restore: {},
              myTool1: {
                show: true,
                title: 'Close',
                icon: `image://${vectorColor}`,
                onclick: handleRemoveClick
              }
            }
          },
          dataZoom: [
            {
              type: 'inside',
              start: 0,
              end: 100,
              zoomOnMouseWheel: true,
              textStyle: textColor
            },
            {
              start: 0,
              end: 100,
              textStyle: textColor
            }
          ],
          series: [
            {
              name: `${indicator.in.indicatorTypeDescription} (${prefix}${indicator.in.indicatorData.unit})`,
              data: indicator.in.indicatorData.data.map((val) => [val.time, (val.value / scale).toFixed(3)]),
              type: 'line', // Use a solid line here
              lineStyle: {
                color: '#0088ff', // Set the color for the line
                smooth: true, // Enable smooth lines
              },
              showSymbol: false, // Hide dot indicators
              color: '#0088ff'
            },
            {
              name: `${indicator.out.indicatorTypeDescription} (${prefix}${indicator.out.indicatorData.unit})`,
              data: indicator.out.indicatorData.data.map((val) => [val.time, (val.value / scale).toFixed(3)]),
              type: 'line', // Use a solid line here
              lineStyle: {
                color: '#ff6600', // Set the color for the line
                smooth: true, // Enable smooth lines
              },
              showSymbol: false, // Hide dot indicators
              color: '#ff6600'
            },
          ],
          title: {
            text: data.data.selectedDevice,
            subtext: `${indicator.in.objectName} => ${indicator.in.objectDescription.substring(0, char_limit)}`,
            textStyle: titleStyle,
            subtextStyle: subTitleStyle
          },
          legend: {
            type: 'plain',
            textStyle: textColor,
            right: '8%'
          },
          theme: sevOneTheme,
        }}
        style={{ width: '100%', height: '100%' }}
      />;
    } else {
      return <ReactECharts
        option={{
          xAxis: {
            type: 'time',
            min: time_start,
            max: time_end,
            axisLabel: {
              textStyle: textColor,
              formatter: (value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
              },
            },
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: (maxY * 1.1) / scale,
            axisLabel: {
              formatter: (value) => maxY < 1 && maxY > 0 ? Number(value).toFixed(3) : Number(value).toFixed(2),
              textStyle: textColor
            },
            axisLine: {
              lineStyle: {
                color: '#aaa',
              },
            },
          },
          tooltip: {
            trigger: 'axis',
            show: true
          },
          toolbox: {
            feature: {
              restore: {},
              myTool1: {
                show: true,
                title: 'Close',
                icon: `image://${vectorColor}`,
                onclick: handleRemoveClick
              }
            }
          },
          dataZoom: [
            {
              type: 'inside',
              start: 0,
              end: 100,
              zoomOnMouseWheel: true,
              textStyle: textColor
            },
            {
              start: 0,
              end: 100,
              textStyle: textColor
            }
          ],
          series: [
            {
              name: `${indicator.indicatorTypeDescription} (${prefix}${indicator.indicatorData.unit})`,
              data: indicator.indicatorData.data.map((val) => [val.time, (val.value / scale).toFixed(3)]),
              type: 'line', // Use a solid line here
              lineStyle: {
                color: '#0088ff', // Set the color for the line
                smooth: true, // Enable smooth lines
              },
              showSymbol: false, // Hide dot indicators
            }
          ],
          title: {
            text: data.data.selectedDevice,
            subtext: `${indicator.objectName} => ${indicator.objectDescription.substring(0, char_limit)}`,
            textStyle: titleStyle,
            subtextStyle: subTitleStyle
          },
          legend: {
            type: 'plain',
            textStyle: textColor,
            right: '8%'
          },
          theme: sevOneTheme,
        }}
        style={{ width: '100%', height: '100%' }}
      />;
    }
  }

  function setFloatChart(indicator, prefix, maxY) {
    if (showFloatChart)
      return;

    showFloatChart = true;
    setIndicator(indicator);
    return;
  }

  function generate_charts(data) {
    if (data.data.indicators.length === 0)
      return <Message type='info'>{`No indicator data for object type ${data.data.objectType} to display. Please select another object type or device.`}</Message>;
  
    if (!data || !data.data.pm.indicators || Object.keys(data.data.pm.indicators).length === 0)
      return <Message type="info">{`No data to show for indicator ${data.data.selectedIndicator.label}. Please select another indicator type.`}</Message>;
  
    const charts = indicatorList.sort().map((indicatorName) => {
      const indicator = data.data.pm.indicators[indicatorName];
  
      let maxY = 0;
      if (data.data.selectedIndicator.value === -1)
        maxY = Math.max(indicator?.in?.indicatorData.maxY || 0, indicator?.out?.indicatorData.maxY || 0);
      else
        maxY = indicator?.indicatorData.maxY || 0;
  
      let scale = 1;
      let prefix = '';
  
      if (maxY > 999 && maxY < 1000000) {
        prefix = 'k';
        scale = 1000;
      } else if (maxY > 999999 && maxY < 1000000000) {
        prefix = 'M';
        scale = 1000000;
      } else if (maxY > 999999999) {
        prefix = 'G';
        scale = 1000000000;
      }
  
      let seriesConfig;
      let subTitle: string;

      if (data.data.selectedIndicator.value === -1) {
        subTitle = indicator.in.objectDescription;
        seriesConfig = [
          {
            id: 'in',
            name: `${indicator?.in?.indicatorTypeDescription || 'In'} (${prefix}${indicator?.in?.indicatorData.unit || ''})`,
            data: indicator?.in?.indicatorData.data.map(val => ({ 'value': [val.time, val.value / scale] })) || [],
            invert: false,
          },
          {
            id: 'out',
            name: `${indicator?.out?.indicatorTypeDescription || 'Out'} (${prefix}${indicator?.out?.indicatorData.unit || ''})`,
            data: indicator?.out?.indicatorData.data.map(val => ({ 'value': [val.time, val.value / scale] })) || [],
            invert: false,
          },
        ];
      } else {
        subTitle = indicator.objectDescription;
        seriesConfig = [
          {
            id: 'in',
            name: `${indicator?.indicatorTypeDescription || 'In'} (${prefix}${indicator?.indicatorData.unit || ''})`,
            data: indicator?.indicatorData.data.map(val => ({ 'value': [val.time, val.value / scale] })) || [],
            invert: false
          }
        ];
      }

      
  
      return (
        <InView key={indicatorName}>
          {({ ref, inView }) => (
            <div
              ref={ref}
              id={indicatorName}
              style={{ height: configuration.chartHeight + 'px', margin: '10px', cursor: 'pointer' }}
              className={'chart-wrapper'}
              onClick={() => setFloatChart(indicatorName, prefix, maxY)}
            >
              {inView && (
                <LineChart
                  xAxisType={'time'}
                  xAxisMin={time_start}
                  xAxisMax={time_end}
                  xAxisFormatter={(value, index) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                  }}
                  yAxisLeft={{
                    formatter: (value) => (maxY < 1 && maxY > 0 ? Number(value).toFixed(3) : Number(value).toFixed(2)),
                  }}
                  yAxisScale={{
                    type: 'value',
                    min: 0,
                    max: (maxY * 1.1) / scale,
                  }}
                  area={false}
                  stack={false}
                  onSelect={(ids) => {
                    console.log('chart selected: ', ids);
                  }}
                  series={seriesConfig}
                  title={indicatorName}
                  subtitle={subTitle}
                  legendType={'standard'}
                  theme={theme}
                />
              )}
            </div>
          )}
        </InView>
      );
    });
    return charts;
  }  

  return (
    <div>
      <div>
        <h3 style={{ display: "inline-block", paddingLeft: '10px' }}>All {data.data.objectType}</h3>
        <div
          style={{
            display: "inline-block",
            textAlign: "right",
            position: "absolute",
            width: "50%",
            right: 0,
            paddingTop: "15px",
          }}
        >
          <input
            id="searchTxt"
            type="text"
            placeholder="Search Objects"
            style={{ width: "50%" }}
            onKeyUp={(event) => {
              if (event.key === "Enter") {
                let searchObj = document.getElementById(
                  "searchTxt"
                ) as HTMLInputElement;
                if (searchObj === null) return;
                searchCharts(searchObj.value);
              }
            }}
          />
          <IconButton onClick={handleClick}>
            <RemoveIcon />
          </IconButton>
          <div style={{ marginRight: "32px", fontSize: "14px" }}>
            {"Showing "} <span id="showObj">{showCount}</span>{` of ${indicatorList.length} objects`}
          </div>
        </div>
      </div>
      <div>
        <table>
          <tbody>
            <tr>
              <td style={{ padding: "10px" }}>
                <span style={{ fontWeight: "bold" }}>Device:</span> {configuration.selectedDevice}
              </td>
              <td style={{ padding: "10px" }}>
                <span style={{ fontWeight: "bold" }}>IP Address:</span> {data.data.ipAddr}
              </td>
              <td style={{ padding: "10px" }}>
                <span style={{ fontWeight: "bold" }}>Plugin:</span> {data.data.plugin}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "10px" }}>
                <span style={{ fontWeight: "bold" }}>Object Type:</span> {data.data.objectType}
              </td>
              <td style={{ padding: "10px" }}>
                <span style={{ fontWeight: "bold" }}>Total Objects:</span> {indicatorList.length}
              </td>
              <td
                style={{
                  padding: "5px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: "bold" }}>Indicator:</span>
                <span style={{ color: 'black', paddingLeft: '5px' }}>
                  <Select
                    name="Indicators"
                    value={data.data.indicators.length === 0 ? { value: 0, label: '--------------------' } : (data.data.indicatorInList ? data.data.selectedIndicator : { value: 0, label: '--------------------' })}
                    options={data.data.indicators}
                    onChange={handleIndicatorChange}
                    isSearchable={true}
                    isClearable={false}
                  />
                </span>
              </td>
              <td style={{ position: "absolute", right: 0, top: 150 }}>
                <IconButton
                  disabled={isMinWidth || isMinHeight}
                  onClick={handleMinusClick}
                >
                  <MinusIcon />
                </IconButton>
                <Slider
                  min={0}
                  max={5}
                  step={1}
                  value={sliderValue}
                  onChange={handleSliderChange}
                // onRelease={handleRelease}
                />
                <IconButton
                  disabled={isMaxWidth || isMaxHeight}
                  onClick={handleAddClick}
                >
                  <AddIcon />
                </IconButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <hr />
      <div
        id="overlay"
        style={{
          position: "fixed",
          zIndex: "0",
          width: "100%",
          height: "100%",
          top: '0',
          left: '0',
          display: "none"
        }}
      ></div>
      <div
        id="floatingChart"
        style={{
          position: "fixed",
          zIndex: 0,
          width: "75%",
          height: "75%",
          left: "12.5%",
          top: "12.5%",
          display: "none",
        }}
      >
        <div id="floatDiv" style={{ width: "100%", height: "100%" }}>
          {float_chart()}
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fit, minmax(${configuration.chartWidth}px, ${configuration.chartWidth}px))`,
          gridGap: "10px",
        }}
      >
        {generate_charts(data)}
      </div>
    </div>
  );
}

DeviceViewer.title = 'Line';
DeviceViewer.icon = icon;
DeviceViewer.settings = settings;

export { DeviceViewer };
