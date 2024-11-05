# SevOne-device-interface-viewer

To run the widget in the widget dev playground environment:
run "wdk-cli run" from the root folder

When you are ready to publish the widget, first pack it (must publish a new version, update in widget.json):

    wdk-cli pack <widget name>

Then publish it to DI system, update your file name, registry info, and tenant as required for your system:

    wdk-cli publish --skip-ssl --file <widget name>.tgz --registry https://<DI_server_IP>/wdkserver --tenant <tenant_name>

ECharts documentation:
https://echarts.apache.org/en/index.html
https://echarts.apache.org/examples/en/index.html
https://echarts.apache.org/examples/en/editor.html?c=area-time-axis
https://echarts.apache.org/en/option.html#title

GraphQL Documentation:
https://www.ibm.com/docs/en/SSUWLY_6.4/datainsight/other/SevOne_Data_Insight_GraphQL_Guide.pdf

Enable GraphQL on Data Insight instance
https://www.ibm.com/docs/en/sevone-npm/6.5?topic=operations-sevone-data-insight-administration-guide

SevOne WDK documentation:

    https://<data_insight_hostname>/docs/
