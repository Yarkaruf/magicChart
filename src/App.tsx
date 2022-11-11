import React, { useEffect, useLayoutEffect, useState } from 'react';
import './App.css';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
interface dataProps {
  ethereum: {
    transactions: [
      {
        time: string,
        gasPrice: number,
        gasValue: number,
        average: number,
        maxGasPrice: number,
        medianGasPrice: number
      }
    ]
  }
}

interface chartsProps {
  date: number,
  value: number
}

function App() {
  const [time, setTime] = useState(Array<chartsProps>);


  const chartInfo = (json: dataProps) => {
    const chartArray = json.ethereum.transactions.map((element) => {
      const [dateValues, timeValues] = element.time.split(' ');
      const [year, month, day] = dateValues.split('-');
      const [hours, minutes] = timeValues.split(':');
      const date = new Date(+('20' + year), +month - 1, +day, +hours, +minutes);
      return {
        date: date.getTime(),
        value: element.gasPrice,
      }
    })
    setTime(chartArray);
  }

  useEffect(() => {
    const getData = async () => {
      const response = await fetch('https://raw.githubusercontent.com/CryptoRStar/GasPriceTestTask/main/gas_price.json');
      const json: dataProps = await response.json();
      chartInfo(json);
    }
    getData()
      .catch(console.error)
  }, []);

  useLayoutEffect(() => {
    let root = am5.Root.new("chartdiv");

    root.setThemes([
      am5themes_Animated.new(root)
    ]);
    root.numberFormatter.setAll({ numberFormat: '#.##', numericFields: ['valueY'] })

    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true
    }));


    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none"
    }));
    cursor.lineY.set("visible", false);

    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      maxDeviation: 0.2,
      baseInterval: {
        timeUnit: "hour",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {}),
      tooltip: am5.Tooltip.new(root, {})
    }));
    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));

    let series = chart.series.push(am5xy.LineSeries.new(root, {
      name: "Series",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      tooltip: am5.Tooltip.new(root, {
        labelText: "gasPrice: {valueY}"
      })
    }));
    chart.set("scrollbarX", am5.Scrollbar.new(root, {
      orientation: "horizontal"
    }));

    let data = time;
    series.data.setAll(data);

    return () => {
      root.dispose();
    };
  }, [time]);

  return (
    <div id='chartdiv' style={{ width: "800px", height: "500px" }}></div>
  );
}

export default App;
